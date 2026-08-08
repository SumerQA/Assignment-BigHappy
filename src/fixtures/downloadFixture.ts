import { test as base } from './pageFixtures';
import path from 'path';
import fs from 'fs';

type DownloadFixture = {
  downloadFile: (trigger: () => Promise<void>) => Promise<string>;
};

export const test = base.extend<DownloadFixture>({
  
  downloadFile: async ({ page }, use) => {
    await use(async (trigger: () => Promise<void>) => {

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        trigger()
      ]);

      const filePath = path.join('downloads', await download.suggestedFilename());
      await download.saveAs(filePath);

      if (!fs.existsSync(filePath)) {
        throw new Error('Download failed!');
      }

      return filePath;
    });
  }
});

export { expect } from '@playwright/test';
