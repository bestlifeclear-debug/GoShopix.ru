/** Собирает фильтр атрибутов из query: attributes[brand]=X или attr_brand=X */
export function parseAttributesFromQuery(
  query: Record<string, unknown>,
): Record<string, string> | undefined {
  const attrs: Record<string, string> = {};

  const nested = query.attributes;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [k, v] of Object.entries(nested)) {
      if (typeof v === 'string' && v.length > 0) attrs[k] = v;
    }
  }

  for (const [key, val] of Object.entries(query)) {
    if (key.startsWith('attr_') && typeof val === 'string' && val.length > 0) {
      attrs[key.slice(5)] = val;
    }
  }

  return Object.keys(attrs).length > 0 ? attrs : undefined;
}
