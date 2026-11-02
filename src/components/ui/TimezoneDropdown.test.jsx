import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { toast } from 'react-hot-toast';
import en from '../../locales/en.json';
import ar from '../../locales/ar.json';
import { TIMEZONE_CHANGE_EVENT } from '../../utils/selectedTimezone';
import TimezoneDropdown from './TimezoneDropdown';

vi.mock('react-hot-toast', () => ({ toast: { success: vi.fn() } }));
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

it.each([
  ['en', 'KSA', 'India (Kolkata)', 'Timezone changed to India (Kolkata)'],
  ['ar', 'السعودية', 'الهند (كولكاتا)', 'تم تغيير المنطقة الزمنية إلى الهند (كولكاتا)'],
])('localizes timezone selection in %s while retaining its IANA value and update event', async (lng, initial, india, message) => {
  const i18n = createInstance();
  await i18n.init({ lng, fallbackLng: false, resources: { en: { translation: en }, ar: { translation: ar } } });
  const changed = vi.fn();
  window.addEventListener(TIMEZONE_CHANGE_EVENT, changed, { once: true });
  render(<I18nextProvider i18n={i18n}><TimezoneDropdown /></I18nextProvider>);
  fireEvent.click(screen.getByRole('button', { name: initial, exact: true }));
  fireEvent.click(screen.getByRole('button', { name: india, exact: true }));
  expect(localStorage.getItem('selectedTimezone')).toBe('Asia/Kolkata');
  expect(changed).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledWith(message);
});
