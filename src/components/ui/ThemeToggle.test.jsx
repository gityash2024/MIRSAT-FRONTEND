import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeModeProvider } from '../../context/ThemeContext';

const renderToggle = () => render(
  <ThemeModeProvider>
    <ThemeToggle />
  </ThemeModeProvider>,
);

const styledCss = () => [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders as an accessible switch that starts in light mode', () => {
    renderToggle();
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('slides the knob and switches the document theme on click', () => {
    renderToggle();
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('mirsat_theme_mode')).toBe('dark');

    const css = styledCss();
    expect(css).toContain('transform:translateX(28px)');
    expect(css).toMatch(/\[dir='rtl'\] [^{]*\{transform:translateX\(-28px\)/);

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('honours a saved dark preference on mount', () => {
    localStorage.setItem('mirsat_theme_mode', 'dark');
    renderToggle();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
