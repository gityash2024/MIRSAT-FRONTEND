import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResponseAttachment from './ResponseAttachment';

describe('ResponseAttachment', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, blob: async () => new Blob(['file']) })));
    URL.createObjectURL = vi.fn(() => 'blob:attachment');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows a hosted image preview, View and Download without exposing its URL as text', () => {
    const url = 'https://res.cloudinary.com/example/image/upload/photo.jpg';
    render(<ResponseAttachment value={url} label="Inspection photo" />);
    expect(screen.getByAltText('Inspection photo preview')).toHaveAttribute('src', url);
    expect(screen.queryByText(url)).toBeNull();
    expect(screen.getByRole('button', { name: 'Download Inspection photo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Inspection photo' }));
    expect(screen.getByRole('dialog', { name: 'Inspection photo preview' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('previews a data PDF through a blob URL and downloads it with a PDF filename', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ResponseAttachment value="data:application/pdf;base64,JVBERi0=" label="Meter printout" />);
    expect(screen.getByText('PDF document')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Meter printout' }));
    await waitFor(() => expect(screen.getByTitle('Meter printout PDF')).toHaveAttribute('src', 'blob:attachment'));
    fireEvent.click(screen.getByRole('button', { name: 'Download Meter printout' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(click.mock.instances[0].download).toBe('meter-printout.pdf');
    expect(screen.queryByText(/JVBERi0/)).toBeNull();
  });

  it('does not open unsupported data content', () => {
    render(<ResponseAttachment value="data:text/html;base64,PGgxPg==" />);
    expect(screen.getByText('Attachment unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /View/ })).toBeNull();
  });
});
