import { useCallback, useEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';
const KEY = 'admin-theme';

const read = (): AdminTheme => {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
};

// Applies the `admin-dark` class to <html> while the admin layout is mounted.
export const useAdminTheme = () => {
  const [theme, setTheme] = useState<AdminTheme>(read);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('admin-dark', theme === 'dark');
    try { localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
  }, [theme]);

  useEffect(() => () => document.documentElement.classList.remove('admin-dark'), []);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 400);
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
};
