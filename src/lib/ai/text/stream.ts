/**
 * Streaming Helper - Утиліти для Server-Sent Events
 */

import { StreamChunk } from '../types';

// ============================================
// SSE ENCODER
// ============================================

/**
 * Створює ReadableStream для SSE
 */
export function createSSEStream(
  generator: AsyncGenerator<StreamChunk>
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          if (chunk.done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }
        }
      } catch (error) {
        const errorChunk = {
          content: '',
          done: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * SSE Response headers
 */
export function getSSEHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };
}

/**
 * Створює SSE Response
 */
export function createSSEResponse(
  generator: AsyncGenerator<StreamChunk>
): Response {
  return new Response(createSSEStream(generator), {
    headers: getSSEHeaders(),
  });
}

// ============================================
// CLIENT-SIDE HELPERS
// ============================================

/**
 * Парсить SSE stream на клієнті
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<StreamChunk> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data) as StreamChunk;
            yield parsed;

            if (parsed.done) {
              return;
            }
          } catch {
            // Ігноруємо невалідний JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Збирає повний текст зі стріму
 */
export async function collectStreamContent(
  generator: AsyncGenerator<StreamChunk>
): Promise<string> {
  let content = '';

  for await (const chunk of generator) {
    content += chunk.content;
    if (chunk.done) break;
  }

  return content;
}

/**
 * Обгортка для timeout
 */
export async function* withTimeout<T>(
  generator: AsyncGenerator<T>,
  timeoutMs: number
): AsyncGenerator<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Stream timeout')), timeoutMs);
  });

  const iterator = generator[Symbol.asyncIterator]();

  while (true) {
    const result = await Promise.race([
      iterator.next(),
      timeoutPromise,
    ]);

    if (result.done) break;
    yield result.value;
  }
}
