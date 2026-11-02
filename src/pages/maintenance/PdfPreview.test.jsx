import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PdfPreview from './PdfPreview';

const { getDocument, destroy } = vi.hoisted(() => ({ getDocument: vi.fn(), destroy: vi.fn() }));
vi.mock('pdfjs-dist', () => ({ getDocument, GlobalWorkerOptions: {} }));
vi.mock('./shared', () => ({ Actions: 'div', Button: 'button', ErrorBox: 'div', Label: 'label', useCopy: () => value => value }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({});
  getDocument.mockReturnValue({ destroy, promise: Promise.resolve({
    numPages: 1,
    getPage: async () => ({ getViewport: () => ({ width: 612, height: 792 }), render: () => ({ promise: Promise.resolve(), cancel() {} }), getTextContent: async () => ({ items: [{ str: 'Private QA document' }] }) }),
  }) });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('renders the authenticated file bytes without asking PDF.js to fetch an object URL again', async () => {
  const bytes = Uint8Array.from([37, 80, 68, 70]);
  const blob = { arrayBuffer: async () => bytes.buffer };
  const view = render(<PdfPreview blob={blob} title="Private QA.pdf" />);
  await waitFor(() => expect(screen.getByText('1 / 1')).toBeInTheDocument());
  expect(getDocument).toHaveBeenCalledWith({ data: bytes, isEvalSupported: false, useSystemFonts: true });
  await waitFor(() => expect(screen.getByText('Private QA document')).toBeInTheDocument());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  view.unmount();
  expect(destroy).toHaveBeenCalledOnce();
});

it('does not start a worker if the preview closes while the private file bytes are being read', async () => {
  let resolve;
  const blob = { arrayBuffer: () => new Promise(done => { resolve = done; }) };
  const view = render(<PdfPreview blob={blob} title="Private QA.pdf" />);
  view.unmount();
  resolve(new ArrayBuffer(4));
  await Promise.resolve();
  expect(getDocument).not.toHaveBeenCalled();
});
