/* Meta (Facebook) Pixel loader + typed event helpers. */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let activePixelId = '';

export const isMetaPixelActive = (): boolean => !!activePixelId;
export const getActiveMetaPixelId = (): string => activePixelId;

/** Loads fbevents.js and inits the pixel. Safe to call multiple times;
 *  re-inits (adding a second pixel ID) only if the ID actually changes. */
export const initMetaPixel = (pixelId?: string): void => {
  const id = (pixelId || import.meta.env.VITE_META_PIXEL_ID || '').trim();
  if (!id || id === activePixelId || typeof window === 'undefined') return;

  if (!window.fbq) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      const n: any = (f.fbq = function (...args: unknown[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }

  activePixelId = id;
  window.fbq!('init', id);
  window.fbq!('track', 'PageView');
};

export const trackPixelPageView = (): void => {
  if (!activePixelId || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
};

export const trackPixelEvent = (event: string, params?: Record<string, unknown>): void => {
  if (!activePixelId || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params);
};

export const trackPixelCustomEvent = (event: string, params?: Record<string, unknown>): void => {
  if (!activePixelId || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('trackCustom', event, params);
};
