/**
 * Utility for estimating and tracking AI token usage
 */

// Rough estimation: 1 token ~= 4 characters for English / 2.5 characters for Indonesian / code
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Account for mixed code and natural language (Indonesian/English)
  return Math.ceil(text.length / 3.2);
}

export function calculateAiCreditCost(promptTokens: number, completionTokens: number): number {
  // 1 AI Credit = 1 processed token
  const total = promptTokens + completionTokens;
  return Math.max(10, total);
}
