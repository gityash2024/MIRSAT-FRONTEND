// Foreground/background pairs for readable statistics and status badges.
// Keep the light surfaces from the reference design; dark mode uses deliberate
// tinted surfaces rather than independently guessing each color.
export const MAINTENANCE_TONES = {
  blue: { light: { background: '#e6f1ff', text: '#1760dd' }, dark: { background: '#16283f', text: '#93c5fd' } },
  amber: { light: { background: '#fff5df', text: '#8c6216' }, dark: { background: '#352a13', text: '#fcd34d' } },
  red: { light: { background: '#ffece7', text: '#a43c32' }, dark: { background: '#3b1e21', text: '#fca5a5' } },
  green: { light: { background: '#e3f7ef', text: '#25664f' }, dark: { background: '#15352c', text: '#86efac' } },
  navy: { light: { background: '#000048', text: '#ffffff' }, dark: { background: '#2b4c9b', text: '#ffffff' } },
};
export const maintenanceTone = (tone, mode = 'light') => (MAINTENANCE_TONES[tone] || MAINTENANCE_TONES.blue)[mode];
export const statusTone = status => ['critical', 'high', 'overdue', 'rejected'].includes(status) ? 'red'
  : ['closed', 'resolved', 'completed', 'approved', 'current', 'controlled'].includes(status) ? 'green'
    : ['medium', 'pending', 'expiring', 'under_assessment'].includes(status) ? 'amber' : 'blue';
