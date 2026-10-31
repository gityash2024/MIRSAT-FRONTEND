import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LegalPage from './LegalPage';
import LegalLinks from '../../components/common/LegalLinks';

const state = vi.hoisted(() => ({ language: 'en', changeLanguage: vi.fn() }));
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: state.language, changeLanguage: state.changeLanguage }),
}));

const page = (documentType) => <MemoryRouter><LegalPage documentType={documentType} /></MemoryRouter>;

beforeEach(() => {
  state.language = 'en';
  state.changeLanguage.mockClear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Public legal documents', () => {
  it('renders the privacy policy and privacy contact without an auth provider or API', () => {
    render(page('privacy'));
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Device permissions and location' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'support@mirsat.co' })).toHaveAttribute('href', 'mailto:support@mirsat.co');
    expect(document.title).toBe('Privacy Policy | Mirsat');
  });

  it('renders terms without login and links to the same stable policy paths', () => {
    render(page('terms'));
    expect(screen.getByRole('heading', { level: 1, name: 'Terms & Conditions' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
    expect(screen.getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute('href', '/terms-and-conditions');
  });

  it('supports Arabic RTL content and explicitly switching back to English', () => {
    state.language = 'ar';
    const { container } = render(page('privacy'));
    expect(screen.getByRole('heading', { level: 1, name: 'سياسة الخصوصية' })).toBeInTheDocument();
    expect(container.querySelector('[lang="ar"][dir="rtl"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(state.changeLanguage).toHaveBeenCalledWith('en');
  });

  it('opens footer documents separately to preserve unfinished inspection forms', () => {
    render(<MemoryRouter><LegalLinks /></MemoryRouter>);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
