export function estimateTokens(input: string): number {
  if (!input.trim()) return 0;
  return Math.ceil(input.length / 4);
}
