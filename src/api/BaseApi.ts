import { APIRequestContext, request } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

type JsonBody = Record<string, unknown>;

class ApiResponseWrapper {
  constructor(private readonly statusCode: number, private readonly bodyText: string) {}

  status(): number {
    return this.statusCode;
  }

  async json(): Promise<JsonBody> {
    if (!this.bodyText) {
      return {};
    }

    try {
      return JSON.parse(this.bodyText) as JsonBody;
    } catch {
      return { value: this.bodyText };
    }
  }
}

export class BaseApi {
  constructor(private readonly baseURL: string = process.env.API_BASE_URL?.trim() || '') {}

  private async createContext(): Promise<APIRequestContext> {
    const apiKey = process.env.REQRES_API_KEY || process.env.API_TOKEN;

    if (!apiKey) {
      throw new Error('No ReqRes API token found. Set REQRES_API_KEY or API_TOKEN in your environment before running API tests.');
    }

    return request.newContext({
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }
    });
  }

  private buildUrl(endpoint: string): string {
    const normalizedBase = this.baseURL.replace(/\/+$/, '');

    if (!normalizedBase) {
      throw new Error('API_BASE_URL is not set. Please configure it in your environment before running API tests.');
    }

    const basePath = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;
    return `${basePath}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  private async sendRequest(method: 'get' | 'post' | 'put' | 'delete', endpoint: string, data?: Record<string, unknown>) {
    const context = await this.createContext();

    try {
      let response;

      switch (method) {
        case 'get':
          response = await context.get(this.buildUrl(endpoint));
          break;
        case 'post':
          response = await context.post(this.buildUrl(endpoint), { data });
          break;
        case 'put':
          response = await context.put(this.buildUrl(endpoint), { data });
          break;
        case 'delete':
          response = await context.delete(this.buildUrl(endpoint));
          break;
      }

      const bodyText = await response.text();
      return new ApiResponseWrapper(response.status(), bodyText);
    } finally {
      await context.dispose();
    }
  }

  async get(endpoint: string) {
    return this.sendRequest('get', endpoint);
  }

  async post(endpoint: string, data: Record<string, unknown>) {
    return this.sendRequest('post', endpoint, data);
  }

  async put(endpoint: string, data: Record<string, unknown>) {
    return this.sendRequest('put', endpoint, data);
  }

  async delete(endpoint: string) {
    return this.sendRequest('delete', endpoint);
  }
}