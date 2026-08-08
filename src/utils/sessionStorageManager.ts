import * as fs from 'fs';
import * as path from 'path';
import { BrowserContext,StorageState } from '@playwright/test';
import { logger } from './logger';

type SessionStorageEntry = {
  origin: string;
  values: Record<string, string>;
};

type PersistedSessionState = {
  storageState: StorageState;
  sessionStorage: SessionStorageEntry[];
};

/**
 * Handles persistence and loading of authenticated browser state.
 *
 * Playwright's native storageState includes cookies and localStorage. It does
 * not include sessionStorage, so this manager persists sessionStorage per
 * origin and restores it with an init script before each test page loads.
 */
export class SessionStorageManager {
  private static readonly SESSION_DIR = path.join(process.cwd(), 'session-state');
  private static readonly STATE_FILE = path.join(SessionStorageManager.SESSION_DIR, 'auth-state.json');

  static initialize(): void {
    if (!fs.existsSync(this.SESSION_DIR)) {
      fs.mkdirSync(this.SESSION_DIR, { recursive: true });
      logger.info(`Session storage directory created: ${this.SESSION_DIR}`);
    }
  }

  static async saveSessionState(context: BrowserContext): Promise<void> {
    try {
      this.initialize();

      const storageState = await context.storageState();
      const sessionStorage = await this.collectSessionStorage(context);
      const state: PersistedSessionState = { storageState, sessionStorage };

      fs.writeFileSync(this.STATE_FILE, JSON.stringify(state, null, 2));
      logger.info(`Session state saved successfully to: ${this.STATE_FILE}`);
      logger.debug(`  - Cookies: ${storageState.cookies.length}`);
      logger.debug(`  - Origins with localStorage: ${storageState.origins.length}`);
      logger.debug(`  - Origins with sessionStorage: ${sessionStorage.length}`);
    } catch (error) {
      logger.error(`Failed to save session state: ${error}`);
      throw new Error(`Session state save failed: ${error}`);
    }
  }

  static loadSessionState(): StorageState | null {
    const state = this.loadPersistedState();
    return state?.storageState ?? null;
  }

  static async applySessionStorage(context: BrowserContext): Promise<void> {
    const state = this.loadPersistedState();
    const sessionStorage = state?.sessionStorage ?? [];

    if (sessionStorage.length === 0) {
      logger.warn('No saved sessionStorage entries found');
      return;
    }

    await context.addInitScript((entries: SessionStorageEntry[]) => {
      const matchingEntry = entries.find((entry) => entry.origin === window.location.origin);

      if (!matchingEntry) {
        return;
      }

      for (const [key, value] of Object.entries(matchingEntry.values)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);

    logger.debug(`SessionStorage init script registered for ${sessionStorage.length} origin(s)`);
  }

  static sessionExists(): boolean {
    return fs.existsSync(this.STATE_FILE);
  }

  static clearSessionState(): void {
    try {
      if (fs.existsSync(this.STATE_FILE)) {
        fs.unlinkSync(this.STATE_FILE);
        logger.info(`Session state cleared: ${this.STATE_FILE}`);
      }
    } catch (error) {
      logger.error(`Failed to clear session state: ${error}`);
      throw error;
    }
  }

  static getStateFilePath(): string {
    return this.STATE_FILE;
  }

  static getSessionFileSize(): number {
    if (!fs.existsSync(this.STATE_FILE)) {
      return 0;
    }

    const stats = fs.statSync(this.STATE_FILE);
    return Math.round(stats.size / 1024);
  }

  private static loadPersistedState(): PersistedSessionState | null {
    try {
      if (!fs.existsSync(this.STATE_FILE)) {
        logger.warn(`Session state file not found: ${this.STATE_FILE}`);
        logger.info('Run tests once to generate the initial session state');
        return null;
      }

      const rawState = JSON.parse(fs.readFileSync(this.STATE_FILE, 'utf-8'));
      const state = this.normalizeState(rawState);

      logger.info(`Session state loaded from: ${this.STATE_FILE}`);
      logger.debug(`  - Cookies: ${state.storageState.cookies.length}`);
      logger.debug(`  - Origins with localStorage: ${state.storageState.origins.length}`);
      logger.debug(`  - Origins with sessionStorage: ${state.sessionStorage.length}`);

      return state;
    } catch (error) {
      logger.error(`Failed to load session state: ${error}`);
      return null;
    }
  }

  private static normalizeState(rawState: any): PersistedSessionState {
    if (rawState?.storageState) {
      return {
        storageState: rawState.storageState,
        sessionStorage: rawState.sessionStorage ?? []
      };
    }

    return {
      storageState: rawState,
      sessionStorage: []
    };
  }

  private static async collectSessionStorage(context: BrowserContext): Promise<SessionStorageEntry[]> {
    const entries: SessionStorageEntry[] = [];
    const seenOrigins = new Set<string>();

    for (const page of context.pages()) {
      const pageUrl = page.url();

      if (!pageUrl || pageUrl === 'about:blank') {
        continue;
      }

      const origin = new URL(pageUrl).origin;

      if (seenOrigins.has(origin)) {
        continue;
      }

      const values = await page.evaluate(() => {
        const items: Record<string, string> = {};

        for (let index = 0; index < window.sessionStorage.length; index++) {
          const key = window.sessionStorage.key(index);

          if (key) {
            items[key] = window.sessionStorage.getItem(key) ?? '';
          }
        }

        return items;
      });

      entries.push({ origin, values });
      seenOrigins.add(origin);
    }

    return entries;
  }
}
