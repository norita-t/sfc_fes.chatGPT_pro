const STORAGE_KEY = 'sfc-festival-guide:favorites';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Could not load favorites from localStorage.', error);
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent('favorites:updated', { detail: favorites }));
}

export function isFavorite(eventId) {
  return getFavorites().includes(eventId);
}

export function toggleFavorite(eventId) {
  const favorites = getFavorites();
  const nextFavorites = favorites.includes(eventId)
    ? favorites.filter((id) => id !== eventId)
    : [...favorites, eventId];

  saveFavorites(nextFavorites);
  return nextFavorites;
}
