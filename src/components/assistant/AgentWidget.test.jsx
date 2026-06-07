import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AgentWidget from './AgentWidget';
import agentService from '../../services/agent.service';

let mockUser = { role: 'admin', email: 'admin@mirsat.com' };

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en', isRTL: false }),
}));

vi.mock('../../services/agent.service', () => ({
  default: {
    capabilities: vi.fn(),
    chat: vi.fn(),
    approve: vi.fn(),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const renderWidget = (path = '/dashboard') => render(<MemoryRouter initialEntries={[path]}><AgentWidget /></MemoryRouter>);

describe('AgentWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUser = { role: 'admin', email: 'admin@mirsat.com' };
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    agentService.capabilities.mockResolvedValue({ enabled: true, textEnabled: true, voiceEnabled: false, browserVoiceFallbackEnabled: true });
  });

  it('stays hidden for inspector portal routes', async () => {
    mockUser = { role: 'inspector', email: 'inspector@mirsat.com' };
    renderWidget('/user-dashboard');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(agentService.capabilities).not.toHaveBeenCalled();
    expect(screen.queryByTitle('MIRSAT Assistant')).not.toBeInTheDocument();
  });

  it('renders a confirmation card and executes only after on-screen approval', async () => {
    agentService.chat.mockResolvedValue({
      conversationId: 'conversation-1',
      assistantMessage: 'I prepared the update.',
      actions: [],
      pendingAction: { id: 'pending-1', summary: 'Change task status to in_progress', preview: { module: 'tasks', action: 'update_status', target: 'Safe task', fields: ['status'] } },
    });
    agentService.approve.mockResolvedValue({ assistantMessage: 'Task updated.', actions: [] });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.change(screen.getByPlaceholderText('Ask about tasks, assets, users, or forms...'), { target: { value: 'Start task' } });
    fireEvent.click(screen.getByTitle('Send'));
    expect(await screen.findByText('Change task status to in_progress')).toBeInTheDocument();
    expect(screen.getByText(/tasks \/ update_status/)).toBeInTheDocument();
    expect(agentService.approve).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(agentService.approve).toHaveBeenCalledWith('pending-1', true));
    expect(await screen.findByText('Task updated.')).toBeInTheDocument();
  });

  it('shows staged draft previews and missing fields inside the assistant', async () => {
    agentService.chat.mockResolvedValue({
      conversationId: 'conversation-1',
      assistantMessage: 'I staged the values.',
      actions: [{
        type: 'update_form_draft_state',
        payload: { values: { q1: 'Good' }, validation: { missingFields: ['Captain name'], errors: [], clarifications: [] } },
      }],
    });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.change(screen.getByPlaceholderText('Ask about tasks, assets, users, or forms...'), { target: { value: 'Fill form' } });
    fireEvent.click(screen.getByTitle('Send'));
    expect(await screen.findByText(/Staged form draft: 1 values/)).toBeInTheDocument();
    expect(screen.getByText(/Captain name/)).toBeInTheDocument();
  });

  it('renders assistant markdown bold text and shows copied feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    agentService.chat.mockResolvedValue({
      conversationId: 'conversation-1',
      assistantMessage: 'Task summary:\n* **High** priority inspection',
      actions: [],
    });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.change(screen.getByPlaceholderText('Ask about tasks, assets, users, or forms...'), { target: { value: 'summarise' } });
    fireEvent.click(screen.getByTitle('Send'));
    const boldText = await screen.findByText('High');
    expect(boldText.tagName).toBe('STRONG');
    const copyButtons = screen.getAllByTitle('Copy message');
    fireEvent.click(copyButtons[copyButtons.length - 1]);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Task summary:\n* **High** priority inspection'));
    expect(await screen.findByTitle('Copied')).toBeInTheDocument();
  });

  it('shows safe user-visible request failures', async () => {
    agentService.chat.mockRejectedValue({ response: { data: { error: { message: 'Assistant provider is temporarily unavailable' } } } });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.change(screen.getByPlaceholderText('Ask about tasks, assets, users, or forms...'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByTitle('Send'));
    expect(await screen.findByText('Assistant provider is temporarily unavailable')).toBeInTheDocument();
  });

  it('shows editable browser voice text in the composer and sends it through text chat', async () => {
    let recognitionInstance;
    class MockSpeechRecognition {
      constructor() {
        recognitionInstance = this;
      }
      start = vi.fn();
      stop = vi.fn(() => this.onend?.());
    }
    window.SpeechRecognition = MockSpeechRecognition;
    agentService.chat.mockResolvedValue({ conversationId: 'conversation-1', assistantMessage: 'Found tasks.', actions: [] });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.click(screen.getByRole('button', { name: /Start voice/ }));
    recognitionInstance.onresult({
      resultIndex: 0,
      results: [{ 0: { transcript: 'show in progress tasks' }, isFinal: true, length: 1 }],
    });
    expect(await screen.findByLabelText('Live transcript preview')).toHaveValue('show in progress tasks');
    fireEvent.change(screen.getByLabelText('Live transcript preview'), { target: { value: 'show pending tasks' } });
    fireEvent.click(screen.getByTitle('Send'));
    await waitFor(() => expect(agentService.chat).toHaveBeenCalledWith('show pending tasks', undefined, '/dashboard', 'dashboard', expect.objectContaining({
      currentFormValues: {},
      visibleFields: [],
    })));
  });

  it('starts a live microphone waveform while browser voice is listening', async () => {
    let recognitionInstance;
    class MockSpeechRecognition {
      constructor() {
        recognitionInstance = this;
      }
      start = vi.fn();
      stop = vi.fn(() => this.onend?.());
    }
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
    const connect = vi.fn();
    const close = vi.fn().mockResolvedValue(undefined);
    class MockAudioContext {
      createAnalyser = () => ({
        fftSize: 0,
        smoothingTimeConstant: 0,
        frequencyBinCount: 1024,
        getByteFrequencyData: data => data.fill(180),
      });
      createMediaStreamSource = () => ({ connect });
      close = close;
    }
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
    window.AudioContext = MockAudioContext;
    window.SpeechRecognition = MockSpeechRecognition;

    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.click(screen.getByRole('button', { name: /Start voice/ }));

    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: expect.any(Object) })));
    expect(recognitionInstance.start).toHaveBeenCalled();
    const wave = screen.getByTestId('agent-live-voice-wave');
    expect(wave.querySelectorAll('span')).toHaveLength(38);
    await waitFor(() => expect(wave.querySelector('span')?.style.getPropertyValue('--voice-level')).not.toBe('0.14'));
  });

  it('sends saved agent memory with the chat context', async () => {
    agentService.chat.mockResolvedValue({ conversationId: 'conversation-1', assistantMessage: 'Saved context used.', actions: [] });
    renderWidget();
    fireEvent.click(await screen.findByTitle('MIRSAT Assistant'));
    fireEvent.click(screen.getByTitle('Agent memory'));
    fireEvent.change(screen.getByLabelText('Agent memory'), { target: { value: 'Always ask before using generated credentials.' } });
    fireEvent.change(screen.getByPlaceholderText('Ask about tasks, assets, users, or forms...'), { target: { value: 'create user' } });
    fireEvent.click(screen.getByTitle('Send'));
    await waitFor(() => expect(agentService.chat).toHaveBeenCalledWith('create user', undefined, '/dashboard', 'dashboard', expect.objectContaining({
      userMemory: 'Always ask before using generated credentials.',
    })));
  });
});
