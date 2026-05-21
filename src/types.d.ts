/**
 * Shared type contracts for the email-summary pipeline (global scope, no exports).
 */

interface EmailCategory {
  name: string;
  emoji: string;
  description: string;
}

interface EmailInput {
  threadId: string;
  messageId: string;
  messageDate: string;
  from: string;
  subject: string;
  content: string;
  link: string;
}

interface EmailSummary extends EmailInput {
  summary: string;
  category: string;
  actionItem: string;
}

interface OpenRouterChatMessage {
  role: string;
  content: string;
}

interface OpenRouterReasoningConfig {
  effort: string;
  exclude: boolean;
}

interface OpenRouterChatCompletionRequest {
  model: string;
  messages: OpenRouterChatMessage[];
  max_completion_tokens: number;
  reasoning?: OpenRouterReasoningConfig;
}

interface OpenRouterErrorBody {
  code?: number;
  message?: string;
}

interface OpenRouterChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: OpenRouterErrorBody;
}

interface DailySummaryResult {
  success: boolean;
  message: string;
}
