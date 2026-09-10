import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGallerySlug } from './gallery-data.js';

test('buildGallerySlug generates a unique slug from a title', () => {
  assert.equal(buildGallerySlug('Mariage de Samuel & Manuella', []), 'mariage-de-samuel-manuella');
  assert.equal(buildGallerySlug('Mariage de Samuel & Manuella', ['mariage-de-samuel-manuella']), 'mariage-de-samuel-manuella-1');
  assert.equal(buildGallerySlug('Mariage de Samuel & Manuella', ['mariage-de-samuel-manuella', 'mariage-de-samuel-manuella-1']), 'mariage-de-samuel-manuella-2');
});
