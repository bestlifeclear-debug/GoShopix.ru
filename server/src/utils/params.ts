/** После Zod-валидации params всё ещё типизированы как ParsedQs — приводим к string */
export function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0]! : value;
}
