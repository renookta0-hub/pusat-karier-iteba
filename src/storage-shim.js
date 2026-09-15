// Polyfills the window.storage.{get,set,delete,list} API that Claude's
// artifact runtime provides, using the browser's localStorage instead.
// This lets App.jsx run unchanged outside claude.ai (e.g. here, in a
// plain Vite app). Swap this out for a real backend/database when you
// move past local development.

function k(key, shared) {
  return (shared ? "shared:" : "personal:") + key;
}

export function installStorageShim() {
  if (typeof window === "undefined" || window.storage) return;

  window.storage = {
    async get(key, shared = false) {
      const raw = localStorage.getItem(k(key, shared));
      if (raw === null) {
        // Matches the documented behavior: missing keys throw rather than
        // resolving to null.
        throw new Error(`storage key not found: ${key}`);
      }
      return { key, value: raw, shared };
    },

    async set(key, value, shared = false) {
      localStorage.setItem(k(key, shared), value);
      return { key, value, shared };
    },

    async delete(key, shared = false) {
      const existed = localStorage.getItem(k(key, shared)) !== null;
      localStorage.removeItem(k(key, shared));
      return { key, deleted: existed, shared };
    },

    async list(prefix = "", shared = false) {
      const tag = shared ? "shared:" : "personal:";
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const full = localStorage.key(i);
        if (full && full.startsWith(tag + prefix)) {
          keys.push(full.slice(tag.length));
        }
      }
      return { keys, prefix, shared };
    },
  };
}
