export interface AIProviderRequest {
  readonly systemPrompt: string;
  readonly userMessage: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
}

export interface AIProviderResponse {
  readonly text: string;
  readonly provider: 'groq' | 'gemini' | 'mock';
  readonly latencyMs: number;
}

export interface AIProvider {
  generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse>;
}

/**
 * GroqAIProvider: Primary production LLM provider using Llama-3.3-70b-versatile
 */
export class GroqAIProvider implements AIProvider {
  private endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !apiKey.startsWith('gsk_')) {
      throw new Error('Groq API Key unavailable or invalid');
    }

    const startTime = Date.now();
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userMessage },
        ],
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 800,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      throw new Error(`Groq provider request failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Groq returned empty response payload');

    return {
      text,
      provider: 'groq',
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * GeminiAIProvider: Fallback LLM provider using Gemini 2.5 Flash
 */
export class GeminiAIProvider implements AIProvider {
  async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('Gemini API Key unavailable');

    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `System Instruction: ${request.systemPrompt}\n\nUser: ${request.userMessage}` }] },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`Gemini provider request failed with HTTP ${res.status}`);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Gemini returned empty response payload');

    return {
      text,
      provider: 'gemini',
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * ResilientAIProvider: Dual-provider orchestrator with automatic fallback
 */
export class ResilientAIProvider implements AIProvider {
  private groq = new GroqAIProvider();
  private gemini = new GeminiAIProvider();

  async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    try {
      return await this.groq.generateCompletion(request);
    } catch (err) {
      console.warn('[ResilientAIProvider] Primary Groq provider failed, switching to Gemini fallback:', err);
      return await this.gemini.generateCompletion(request);
    }
  }
}
