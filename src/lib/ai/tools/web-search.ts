/**
 * Web Search Tool - Інструмент для веб-пошуку
 */

import { Tool } from '../types';

/**
 * Web Search Tool Definition
 * Використовується для пошуку актуальної інформації в інтернеті
 */
export const WEB_SEARCH_TOOL: Tool = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Виконує пошук в інтернеті через Google для отримання актуальної інформації. Використовуй цю функцію коли потрібна поточна інформація, новини, факти, статистика, погода, події, дати, ціни, рейтинги та інша актуальна інформація, яка може змінитися з часом.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Пошуковий запит на українській або англійській мові. Будь конкретним та детальним для кращих результатів.',
        },
        num: {
          type: 'number',
          description: 'Кількість результатів для отримання (1-10, за замовчуванням 5)',
          minimum: 1,
          maximum: 10,
        },
      },
      required: ['query'],
    },
  },
};

/**
 * Виконати веб-пошук
 */
export async function executeWebSearch(query: string, num: number = 5): Promise<string> {
  try {
    const response = await fetch('/api/web/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        num,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Помилка при виконанні пошуку');
    }

    const data = await response.json();

    // Форматуємо результат для AI моделі
    let result = `🔍 Результати пошуку для "${data.query}":\n\n`;

    // Додаємо answerBox якщо є (швидка відповідь)
    if (data.answerBox) {
      result += `💡 Швидка відповідь:\n`;
      if (data.answerBox.answer) {
        result += `${data.answerBox.answer}\n`;
      }
      if (data.answerBox.snippet) {
        result += `${data.answerBox.snippet}\n`;
      }
      if (data.answerBox.link) {
        result += `Джерело: ${data.answerBox.link}\n`;
      }
      result += `\n`;
    }

    // Додаємо knowledgeGraph якщо є (інформаційна панель)
    if (data.knowledgeGraph) {
      result += `📊 ${data.knowledgeGraph.title || 'Інформація'}:\n`;
      if (data.knowledgeGraph.description) {
        result += `${data.knowledgeGraph.description}\n`;
      }
      if (data.knowledgeGraph.website) {
        result += `Джерело: ${data.knowledgeGraph.website}\n`;
      }
      result += `\n`;
    }

    // Додаємо результати пошуку
    if (data.results && data.results.length > 0) {
      result += `📰 Результати пошуку:\n\n`;
      data.results.forEach((item: any, index: number) => {
        result += `${index + 1}. ${item.title}\n`;
        result += `   ${item.snippet}\n`;
        result += `   ${item.link}\n\n`;
      });
    } else {
      result += `❌ Результати пошуку не знайдено.\n`;
    }

    return result.trim();
  } catch (error) {
    return `Помилка при виконанні веб-пошуку: ${error instanceof Error ? error.message : 'Невідома помилка'}`;
  }
}
