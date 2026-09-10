export function slugifyGalleryTitle(value = '') {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildGallerySlug(title, existingSlugs = []) {
  const base = slugifyGalleryTitle(title) || 'galerie';
  const seen = new Set((existingSlugs || []).map((value) => String(value).toLowerCase()));

  if (!seen.has(base)) {
    return base;
  }

  let index = 1;
  let candidate = `${base}-${index}`;
  while (seen.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }

  return candidate;
}
