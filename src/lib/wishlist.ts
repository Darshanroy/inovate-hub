const WISHLIST_KEY = 'wishlist:hackathons';

function safeGetWindow(): Window | null {
  try {
    return typeof window !== 'undefined' ? window : null;
  } catch {
    return null;
  }
}

export function getWishlist(): Set<string> {
  const win = safeGetWindow();
  if (!win) return new Set();
  try {
    const raw = win.localStorage.getItem(WISHLIST_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function setWishlist(ids: Set<string>): void {
  const win = safeGetWindow();
  if (!win) return;
  try {
    const arr = Array.from(ids);
    win.localStorage.setItem(WISHLIST_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function toggleWishlist(id: string, on: boolean): Set<string> {
  const current = getWishlist();
  if (on) current.add(id); else current.delete(id);
  setWishlist(current);
  return current;
}

export function isWishlisted(id: string): boolean {
  return getWishlist().has(id);
}


