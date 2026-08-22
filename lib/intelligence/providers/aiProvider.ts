export interface AIProviderRequest {
  readonly systemPrompt: string;
  readonly userMessage: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
}

export interface AIProviderResponse {
  readonly text: string;
  readonly provider: 'anthropic' | 'groq' | 'gemini' | 'mock';
  readonly latencyMs: number;
}

export interface AIProvider {
  generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse>;
}

/**
 * AnthropicAIProvider: Claude 3.5 Sonnet / Haiku LLM provider
 */
export class AnthropicAIProvider implements AIProvider {
  private endpoint = 'https://api.anthropic.com/v1/messages';

  async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API Key unavailable or invalid');
    }

    const startTime = Date.now();
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    console.log('[AI_CALL_START]', {
      provider: 'anthropic',
      model,
      inputLength: request.userMessage.length,
      timestamp: startTime,
    });

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          system: request.systemPrompt,
          messages: [{ role: 'user', content: request.userMessage }],
          temperature: request.temperature ?? 0.1,
          max_tokens: request.maxTokens ?? 2500,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Anthropic request failed with HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await res.json();
      const textBlock = data?.content?.find((c: any) => c.type === 'text') || data?.content?.[0];
      const text = textBlock?.text?.trim();
      if (!text) throw new Error('Anthropic returned empty response payload');

      const latencyMs = Date.now() - startTime;
      console.log('[AI_CALL_SUCCESS]', {
        provider: 'anthropic',
        outputLength: text.length,
        latencyMs,
      });

      return {
        text,
        provider: 'anthropic',
        latencyMs,
      };
    } catch (err: any) {
      console.warn('[AI_CALL_FAILED]', {
        provider: 'anthropic',
        error: err?.message,
        status: err?.status || err?.name,
      });
      throw err;
    }
  }
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
    const model = 'llama-3.3-70b-versatile';
    console.log('[AI_CALL_START]', {
      provider: 'groq',
      model,
      inputLength: request.userMessage.length,
      timestamp: startTime,
    });

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userMessage },
          ],
          temperature: request.temperature ?? 0.2,
          max_tokens: request.maxTokens ?? 2000,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Groq provider request failed with HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Groq returned empty response payload');

      const latencyMs = Date.now() - startTime;
      console.log('[AI_CALL_SUCCESS]', {
        provider: 'groq',
        outputLength: text.length,
        latencyMs,
      });

      return {
        text,
        provider: 'groq',
        latencyMs,
      };
    } catch (err: any) {
      console.warn('[AI_CALL_FAILED]', {
        provider: 'groq',
        error: err?.message,
        status: err?.status,
      });
      throw err;
    }
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
    const model = 'gemini-2.5-flash';
    console.log('[AI_CALL_START]', {
      provider: 'gemini',
      model,
      inputLength: request.userMessage.length,
      timestamp: startTime,
    });

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `System Instruction: ${request.systemPrompt}\n\nUser: ${request.userMessage}` }] },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Gemini provider request failed with HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) throw new Error('Gemini returned empty response payload');

      const latencyMs = Date.now() - startTime;
      console.log('[AI_CALL_SUCCESS]', {
        provider: 'gemini',
        outputLength: text.length,
        latencyMs,
      });

      return {
        text,
        provider: 'gemini',
        latencyMs,
      };
    } catch (err: any) {
      console.warn('[AI_CALL_FAILED]', {
        provider: 'gemini',
        error: err?.message,
        status: err?.status,
      });
      throw err;
    }
  }
}

/**
 * ResilientAIProvider: Multi-provider orchestrator with automatic fallback
 * Priority order: Anthropic -> Groq -> Gemini
 */
export class ResilientAIProvider implements AIProvider {
  private anthropic = new AnthropicAIProvider();
  private groq = new GroqAIProvider();
  private gemini = new GeminiAIProvider();

  async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    // 1. Try Anthropic if key exists
    if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
      try {
        return await this.anthropic.generateCompletion(request);
      } catch (err: any) {
        console.warn('[ResilientAIProvider] Anthropic failed, falling back to Groq/Gemini:', err?.message);
      }
    }

    // 2. Try Groq
    if (process.env.GROQ_API_KEY) {
      try {
        return await this.groq.generateCompletion(request);
      } catch (err: any) {
        console.warn('[ResilientAIProvider] Groq failed, falling back to Gemini:', err?.message);
      }
    }

    // 3. Try Gemini
    return await this.gemini.generateCompletion(request);
  }
}

