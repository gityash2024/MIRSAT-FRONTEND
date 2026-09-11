import styled from 'styled-components';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../context/ThemeContext';
import { DARK_PALETTE } from '../../theme/darkPalette';

/**
 * Light/dark switch for the top bar.
 *
 * A pill track with a sun on one end and a moon on the other; the knob slides
 * to whichever side is active and carries that icon. Sized like the other
 * top-bar controls, and uses logical offsets so it flips correctly in RTL.
 */

const TRACK_WIDTH = 58;
const TRACK_HEIGHT = 30;
const KNOB_SIZE = 24;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - 6; // 3px inset on each side

const Track = styled.button`
  position: relative;
  width: ${TRACK_WIDTH}px;
  height: ${TRACK_HEIGHT}px;
  flex-shrink: 0;
  padding: 0;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  cursor: pointer;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(75, 140, 158, 0.35);
  }

  @media (max-width: 480px) {
    transform: scale(0.9);
    transform-origin: center;
  }

  html[data-theme='dark'] & {
    background: #202020;
    border-color: #343434;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  html[data-theme='dark'] &:hover {
    border-color: ${DARK_PALETTE.gold};
  }

  html[data-theme='dark'] &:focus-visible {
    box-shadow: 0 0 0 3px rgba(245, 196, 81, 0.4);
  }
`;

const TrackIcon = styled.span`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${KNOB_SIZE}px;
  height: ${KNOB_SIZE}px;
  inset-inline-start: ${props => (props.$side === 'start' ? '2px' : 'auto')};
  inset-inline-end: ${props => (props.$side === 'end' ? '2px' : 'auto')};
  color: ${props => (props.$side === 'start' ? '#f59e0b' : '#94a3b8')};
  opacity: ${props => (props.$active ? 0 : 1)};
  transition: opacity 0.25s ease;
  pointer-events: none;

  html[data-theme='dark'] & {
    color: ${props => (props.$side === 'start' ? '#8a8f9c' : DARK_PALETTE.gold)};
  }
`;

const Knob = styled.span`
  position: absolute;
  top: 2px;
  inset-inline-start: 2px;
  width: ${KNOB_SIZE}px;
  height: ${KNOB_SIZE}px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  transform: translateX(${props => (props.$on ? `${KNOB_TRAVEL}px` : '0')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, color 0.3s ease;

  [dir='rtl'] & {
    transform: translateX(${props => (props.$on ? `-${KNOB_TRAVEL}px` : '0')});
  }

  html[data-theme='dark'] & {
    background: ${DARK_PALETTE.gold};
    color: #111111;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }
`;

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useTranslation();
  const label = isDark
    ? t('common.switchToLightMode', 'Switch to light mode')
    : t('common.switchToDarkMode', 'Switch to dark mode');

  return (
    <Track
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <TrackIcon $side="start" $active={!isDark} aria-hidden="true">
        <Sun size={14} />
      </TrackIcon>
      <TrackIcon $side="end" $active={isDark} aria-hidden="true">
        <Moon size={14} />
      </TrackIcon>
      <Knob $on={isDark} aria-hidden="true">
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </Knob>
    </Track>
  );
};

export default ThemeToggle;
