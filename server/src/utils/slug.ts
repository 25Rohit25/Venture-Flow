export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || 'startup'}-${randomSuffix}`;
}
