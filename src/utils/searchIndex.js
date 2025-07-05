export function createSearchIndex(items) {
  const searchIndex = new Map();

  for (const item of items) {
    const originalName = item.name.toLowerCase();
    if (!originalName) continue;

    const normalizedName = originalName.replace(/[^a-z0-9\s]+/g, ' ').trim();
    const words = normalizedName.split(/\s+/).filter(Boolean);
    const uniqueKeys = new Set();

    for (const word of words) {
      for (let i = 1; i <= word.length; i++) {
        uniqueKeys.add(word.substring(0, i));
      }

      if (word.length >= 3) {
        for (let i = 0; i <= word.length - 3; i++) {
          uniqueKeys.add(word.substring(i, i + 3));
        }
      }
    }

    const concatenatedName = words.join('');
    if (concatenatedName.length >= 3) {
      for (let i = 0; i <= concatenatedName.length - 3; i++) {
        uniqueKeys.add(concatenatedName.substring(i, i + 3));
      }
    }
    
    for (const key of uniqueKeys) {
      if (!searchIndex.has(key)) {
        searchIndex.set(key, new Set());
      }
      searchIndex.get(key).add(item);
    }
  }

  return searchIndex;
}