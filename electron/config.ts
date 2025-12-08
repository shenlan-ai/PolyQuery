import * as dotenv from 'dotenv';

dotenv.config();

class LLMConfiguration {
  private apiKey: string | undefined;
  private baseUrl: string | undefined;
  private model: string | undefined;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY;
    this.baseUrl = process.env.LLM_BASE_URL;
    this.model = process.env.LLM_MODEL;
  }

  get llmApiKey(): string {
    if (!this.apiKey) {
      throw new Error("LLM_API_KEY not found in environment variables");
    }
    return this.apiKey;
  }

  get llmBaseUrl(): string {
    if (!this.baseUrl) {
      throw new Error("LLM_BASE_URL not found in environment variables");
    }
    return this.baseUrl;
  }

  get llmModel(): string {
    if (!this.model) {
      throw new Error("LLM_MODEL not found in environment variables");
    }
    return this.model;
  }
}

export const llmConfig = new LLMConfiguration();
