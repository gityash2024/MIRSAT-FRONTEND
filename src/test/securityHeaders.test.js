/**
 * Guards the response headers declared in vercel.json.
 *
 * This exists because of a real regression: `Permissions-Policy: camera=()`
 * was shipped, which is an EMPTY allowlist and therefore blocks the feature for
 * every origin including our own. It silently broke inspection photo capture
 * and the GPS metadata attached to captures, while the browser permission
 * prompt still reported "allowed".
 *
 * A presence-only check would have passed. These assert the VALUES.
 */
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));

const siteWide = config.headers.find((rule) => rule.source === '/(.*)');
const header = (key) => siteWide.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;

describe('vercel.json security headers', () => {
  test('a site-wide header rule exists', () => {
    expect(siteWide).toBeDefined();
  });

  test.each([
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ])('%s is present', (key) => {
    expect(header(key)).toBeTruthy();
  });

  describe('Permissions-Policy', () => {
    const value = () => header('Permissions-Policy');

    // The regression this file was written for.
    test.each(['camera', 'microphone', 'geolocation'])(
      '%s is allowed for self - the app uses it',
      (feature) => {
        expect(value()).toContain(`${feature}=(self)`);
        expect(value()).not.toMatch(new RegExp(`${feature}=\\(\\)`));
      }
    );

    test.each(['payment', 'usb'])('%s stays fully disabled - unused by the app', (feature) => {
      expect(value()).toContain(`${feature}=()`);
    });
  });

  describe('Content-Security-Policy', () => {
    const directive = (name) => {
      const match = header('Content-Security-Policy').match(new RegExp(`${name} ([^;]+)`));
      return match ? match[1].trim() : null;
    };

    test('object-src and frame-ancestors are locked down', () => {
      expect(directive('object-src')).toBe("'none'");
      expect(directive('frame-ancestors')).toBe("'none'");
    });

    test('default-src and base-uri are self', () => {
      expect(directive('default-src')).toBe("'self'");
      expect(directive('base-uri')).toBe("'self'");
    });

    test('no wildcard source anywhere', () => {
      expect(header('Content-Security-Policy')).not.toMatch(/(^|[\s;])\*/);
    });

    test("script-src does not permit 'unsafe-eval'", () => {
      expect(directive('script-src')).not.toContain("'unsafe-eval'");
    });

    test('connect-src reaches both API origins and their websockets', () => {
      const connect = directive('connect-src');
      ['https://mirsat.mymultimeds.com', 'https://mirsatprod.mymultimeds.com',
       'wss://mirsat.mymultimeds.com', 'wss://mirsatprod.mymultimeds.com'].forEach((origin) => {
        expect(connect).toContain(origin);
      });
    });
  });

  test('X-Frame-Options denies framing', () => {
    expect(header('X-Frame-Options')).toBe('DENY');
  });

  test('HSTS is at least one year and covers subdomains', () => {
    const hsts = header('Strict-Transport-Security');
    expect(hsts).toContain('includeSubDomains');
    expect(Number(hsts.match(/max-age=(\d+)/)[1])).toBeGreaterThanOrEqual(31536000);
  });

  test('X-Content-Type-Options is nosniff', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
  });
});
