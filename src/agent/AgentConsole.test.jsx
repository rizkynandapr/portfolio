import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import AgentConsole from './AgentConsole.jsx';
import { openAgent } from './agentBus.js';
import { QUICK } from './quickAnswers.js';

function mockFetch({ live = false, chat } = {}) {
  globalThis.fetch = vi.fn(async (url) => {
    if (url === '/api/status') return { ok: true, json: async () => ({ live }) };
    if (url === '/api/chat') return chat ?? { ok: false, status: 503, json: async () => ({ error: 'agent_offline' }) };
    throw new Error('unexpected ' + url);
  });
}

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
afterEach(() => { vi.useRealTimers(); delete globalThis.fetch; });

async function openConsole() {
  render(<AgentConsole />);
  await act(async () => { openAgent(); });
  await act(async () => { await Promise.resolve(); });
}

describe('AgentConsole', () => {
  it('shows the offline badge when live answers are off', async () => {
    mockFetch({ live: false });
    await openConsole();
    expect(await screen.findByText('quick answers')).toBeInTheDocument();
  });

  it('answers a suggested question instantly, without calling the model', async () => {
    mockFetch({ live: false });
    await openConsole();
    fireEvent.click(screen.getByRole('button', { name: QUICK[0].q }));
    await act(async () => { vi.advanceTimersByTime(600); });
    expect(await screen.findByText((t) => t.startsWith('Start with LegalitasAI'))).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalledWith('/api/chat', expect.anything());
  });

  it('offers to email a free-form question when offline', async () => {
    mockFetch({ live: false });
    await openConsole();
    await screen.findByText('quick answers');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Kamu kerja di mana sekarang?' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form'));
    const link = await screen.findByRole('link', { name: /Email this question/ });
    expect(link.getAttribute('href')).toContain('mailto:rizkynandapr@gmail.com');
    expect(link.getAttribute('href')).toContain(encodeURIComponent('Kamu kerja di mana sekarang?'));
    expect(screen.getByText(/Jawaban live lagi dimatikan/)).toBeInTheDocument();
  });

  it('shows the live reply as plain text', async () => {
    mockFetch({ live: true, chat: { ok: true, status: 200, json: async () => ({ reply: '<b>hi</b> there' }) } });
    await openConsole();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form'));
    expect(await screen.findByText(/<b>hi<\/b> there/)).toBeInTheDocument();
  });
});
