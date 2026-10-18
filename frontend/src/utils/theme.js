// Utilidad centralizada de tema (claro / oscuro / sistema)
export const THEME_KEY = 'campusventa_theme';
const LEGACY_KEY = 'campusventa_tema';

const THEME_COLORS = { light: '#A6192E', dark: '#050507' };

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_KEY) || 'claro';
}

function prefersDark() {
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function resolveIsDark(tema) {
  if (tema === 'oscuro') return true;
  if (tema === 'claro') return false;
  return prefersDark();
}

export function applyTheme(tema, { persist = true } = {}) {
  if (persist) {
    localStorage.setItem(THEME_KEY, tema);
    localStorage.removeItem(LEGACY_KEY);
  }
  const isDark = resolveIsDark(tema);
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
}

// Reaplica el tema si el usuario eligió "sistema" y cambia la preferencia del SO
export function watchSystemTheme() {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getStoredTheme() === 'sistema') applyTheme('sistema', { persist: false });
  };
  mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
  return () => (mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler));
}
