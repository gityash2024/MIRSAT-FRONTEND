import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DocumentNamingModal from '../components/ui/DocumentNamingModal';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Test User', role: 'admin' } }),
}));

// A promise the test settles by hand, standing in for an in-flight API call.
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

describe('ConfirmationModal action guard', () => {
  const renderModal = (props) => render(
    <ConfirmationModal isOpen onClose={vi.fn()} confirmText="Delete" cancelText="Cancel" {...props} />
  );

  it('sends an async confirm only once on a double click', async () => {
    const request = deferred();
    const onConfirm = vi.fn(() => request.promise);
    renderModal({ onConfirm });

    const confirm = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => { request.resolve(); await request.promise; });
  });

  it('disables both buttons and shows progress while the request runs', async () => {
    const request = deferred();
    const onClose = vi.fn();
    renderModal({ onConfirm: () => request.promise, onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    const busyConfirm = screen.getByRole('button', { name: /Processing/ });
    expect(busyConfirm).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => { request.resolve(); await request.promise; });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('unlocks again after a failed request so the user can retry', async () => {
    const request = deferred();
    const onConfirm = vi.fn(() => request.promise);
    renderModal({ onConfirm });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await act(async () => { request.reject(new Error('network')); await request.promise.catch(() => {}); });

    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('leaves synchronous confirm handlers unchanged', () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });

    const confirm = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledTimes(2);
    expect(confirm).toBeEnabled();
  });

  it('still honours an explicit loading prop', () => {
    renderModal({ onConfirm: vi.fn(), loading: true });
    expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
  });
});

describe('DocumentNamingModal export guard', () => {
  const exportButton = () => document.querySelector('[data-agent-action="document_export.confirm"]');

  it('runs an async export only once on a double click and locks the button', async () => {
    const request = deferred();
    const onExport = vi.fn(() => request.promise);
    render(<DocumentNamingModal isOpen onClose={vi.fn()} onExport={onExport} exportFormat="pdf" />);

    fireEvent.click(exportButton());
    fireEvent.click(exportButton());

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(exportButton()).toBeDisabled();

    await act(async () => { request.resolve(); await request.promise; });
    expect(exportButton()).toBeEnabled();
  });

  it('keeps synchronous export handlers working as before', () => {
    const onExport = vi.fn();
    render(<DocumentNamingModal isOpen onClose={vi.fn()} onExport={onExport} exportFormat="csv" />);

    fireEvent.click(exportButton());

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(exportButton()).toBeEnabled();
  });
});
