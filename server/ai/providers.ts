import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, GENERATE_HTML_PROMPT, EDIT_HTML_PROMPT, WELCOME_MESSAGE } from './prompts';

// AI Provider types
export type AIProvider = 'claude' | 'openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  message: string;
  html?: string;
}

// Lazy initialization
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY не настроен');
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY не настроен');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Check which AI providers are configured
 */
export function getAvailableProviders(): { claude: boolean; openai: boolean } {
  return {
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
}

/**
 * Get the best available provider
 * Default: Claude Sonnet 4, Alternative: OpenAI GPT-4.1
 */
export function getDefaultProvider(): AIProvider | null {
  const available = getAvailableProviders();
  // Claude is the default provider for better quality
  if (available.claude) return 'claude';
  if (available.openai) return 'openai';
  return null;
}

/**
 * Send message to Claude
 */
async function sendToClaude(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const anthropic = getAnthropic();
  
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101', // Claude Opus 4.5
    max_tokens: 16384,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

/**
 * Send message to OpenAI
 */
async function sendToOpenAI(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1', // GPT-4.1 (default AI model)
    max_tokens: 16384,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Main function to process chat message
 * 
 * ЛОГИКА:
 * 1. Если currentHtml СУЩЕСТВУЕТ — ВСЕГДА редактировать (EDIT_HTML_PROMPT)
 * 2. Если currentHtml ПУСТОЙ — сначала диалог, потом генерация (GENERATE_HTML_PROMPT)
 * 3. Новая генерация только по явному запросу "сгенерируй заново" или "новый дизайн"
 */
export async function processMessage(
  provider: AIProvider,
  messages: Message[],
  currentHtml: string | null
): Promise<AIResponse> {
  try {
    const lastMessage = messages[messages.length - 1];
    const lowerMessage = lastMessage.content.toLowerCase();
    
    // Check if user explicitly wants a NEW design (full regeneration)
    const wantsNewDesign = isExplicitNewDesignRequest(lowerMessage);
    
    // ГЛАВНОЕ ПРАВИЛО: Если HTML уже есть И пользователь НЕ просит новый дизайн — РЕДАКТИРОВАТЬ
    if (currentHtml && !wantsNewDesign) {
      console.log('[AI] Editing existing HTML (preserving design)');
      
      // Edit existing HTML - сохраняем текущий дизайн
      const editPrompt = EDIT_HTML_PROMPT
        .replace('{current_html}', currentHtml)
        .replace('{user_request}', lastMessage.content);
      
      const editMessages: Message[] = [{ role: 'user', content: editPrompt }];
      
      const response = provider === 'claude' 
        ? await sendToClaude(editMessages, SYSTEM_PROMPT)
        : await sendToOpenAI(editMessages, SYSTEM_PROMPT);
      
      const html = extractHtml(response);
      if (html) {
        return {
          message: 'Готово! Изменения применены. Посмотрите на превью.',
          html,
        };
      }
      
      // If no HTML extracted, return the text response
      return { message: response };
    }

    // Нет HTML — проверяем, нужно ли генерировать
    const shouldGenerate = shouldGenerateHtml(lowerMessage, messages.length);
    
    if (shouldGenerate || wantsNewDesign) {
      console.log('[AI] Generating new HTML');
      
      // Generate new HTML
      const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const genPrompt = GENERATE_HTML_PROMPT + '\n' + context;
      
      const genMessages: Message[] = [{ role: 'user', content: genPrompt }];
      
      const response = provider === 'claude'
        ? await sendToClaude(genMessages, SYSTEM_PROMPT)
        : await sendToOpenAI(genMessages, SYSTEM_PROMPT);
      
      const html = extractHtml(response);
      if (html) {
        return {
          message: wantsNewDesign 
            ? 'Создал новый дизайн! Если хотите что-то изменить — просто напишите.'
            : 'Приглашение создано! Посмотрите на превью. Если хотите что-то изменить — просто напишите.',
          html,
        };
      }
    }

    // Regular conversation (gathering info before first generation)
    console.log('[AI] Conversation mode');
    const response = provider === 'claude'
      ? await sendToClaude(messages, SYSTEM_PROMPT)
      : await sendToOpenAI(messages, SYSTEM_PROMPT);

    // Check if response contains HTML
    const html = extractHtml(response);
    if (html) {
      return {
        message: 'Вот что получилось! Если хотите изменить — просто напишите.',
        html,
      };
    }

    return { message: response };
  } catch (error) {
    console.error('[AI] Error processing message:', error);
    throw new Error('Ошибка при обработке сообщения. Попробуйте ещё раз.');
  }
}

/**
 * Check if user explicitly wants a completely NEW design
 */
function isExplicitNewDesignRequest(message: string): boolean {
  const newDesignTriggers = [
    'новый дизайн',
    'заново',
    'сначала',
    'другой дизайн',
    'новое приглашение',
    'сгенерируй заново',
    'переделай полностью',
    'с нуля',
    'new design',
    'start over',
    'regenerate',
  ];
  
  return newDesignTriggers.some(t => message.includes(t));
}

/**
 * Check if user wants HTML generation (first time)
 */
function shouldGenerateHtml(message: string, messageCount: number): boolean {
  const triggers = [
    'создай', 'сделай', 'сгенерируй', 'генерируй',
    'готов', 'погнали', 'давай', 'начни',
    'create', 'generate', 'make', 'build',
    'жаса', 'құр', // казахский
  ];
  
  // If enough context gathered (3+ messages) and user gives go-ahead
  if (messageCount >= 3) {
    for (const trigger of triggers) {
      if (message.includes(trigger)) return true;
    }
  }
  
  // Explicit requests
  if (message.includes('html') || message.includes('приглашение готов')) {
    return true;
  }
  
  return false;
}

/**
 * Extract HTML from AI response
 */
function extractHtml(response: string): string | null {
  // Try to find HTML document
  const htmlMatch = response.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (htmlMatch) {
    return htmlMatch[0];
  }
  
  // Try markdown code block
  const codeBlockMatch = response.match(/```(?:html)?\s*(<!DOCTYPE[\s\S]*?<\/html>)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Check if response starts with DOCTYPE
  if (response.trim().toLowerCase().startsWith('<!doctype')) {
    return response.trim();
  }
  
  return null;
}

/**
 * Get welcome message
 */
export function getWelcomeMessage(): string {
  return WELCOME_MESSAGE;
}
