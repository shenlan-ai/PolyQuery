import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { llmConfig } from './config.ts';

/**
 * A class for handling conversations with OpenAI's LLM models.
 */
class LLMConversation {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private client: OpenAI;

  /**
   * Initialize the LLM conversation handler.
   * @param apiKey API key. If undefined, will use config.llmApiKey
   * @param baseUrl Base URL for the API. If undefined, will use config.llmBaseUrl
   * @param model The model to use. If undefined, will use config.llmModel
   * @param temperature Controls randomness in the response (0.0 to 1.0)
   */
  constructor(
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    temperature: number = 0.7
  ) {
    this.apiKey = apiKey || llmConfig.llmApiKey;
    this.baseUrl = baseUrl || llmConfig.llmBaseUrl;
    this.model = model || llmConfig.llmModel;
    this.temperature = temperature;
    // Initialize the OpenAI client
    try {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
      });
    } catch (error) {
      console.error('OpenAI client creation error:', error);
      throw error;
    }
  }

  /**
   * Send a message to the LLM and get the response.
   * @param messages List of messages in the conversation
   * @param maxTokens Maximum number of tokens in the response
   * @returns The assistant's response
   */
  async sendMessage(
    messages: ChatCompletionMessageParam[],
    maxTokens?: number
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: maxTokens ?? null,
      });
      // Extract the response content
      const assistantMessage = response.choices[0]?.message?.content;
      return assistantMessage || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error(`Error sending message: ${error}`);
    }
  }

  /**
   * Change the model being used.
   * @param model The new model name
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Change the temperature setting.
   * @param temperature New temperature value (0.0 to 1.0)
   */
  setTemperature(temperature: number): void {
    if (temperature < 0.0 || temperature > 1.0) {
      throw new Error('Temperature must be between 0.0 and 1.0');
    }
    this.temperature = temperature;
  }
}

export default LLMConversation;
