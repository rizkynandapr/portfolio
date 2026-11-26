import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import LiveDemo from './LiveDemo.jsx';
import Compact from './Compact.jsx';

const PROJECT = {
  id: '07',
  name: 'BBCA Forecast Desk',
  tag: 'Stock forecast',
  period: 'Sep 2026',
  problem: 'p',
  build: 'b',
  stack: ['Python'],
  links: { demo: 'https://huggingface.co/spaces/nandutt/bbca-forecast', code: 'https://github.com/x/y' },
  embed: 'https://nandutt-bbca-forecast.hf.space',
  tryHint: 'Choose how many sessions to forecast.',
};

describe('LiveDemo', () => {
  it('loads nothing until the visitor launches it', () => {
    const { container } = render(<LiveDemo project={PROJECT} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(PROJECT.tryHint)).toBeInTheDocument();
  });

  it('mounts the Space in a sandboxed frame on launch, and unloads it on close', async () => {
    const { container } = render(<LiveDemo project={PROJECT} />);
    await act(async () => { screen.getByRole('button', { name: /Launch demo/ }).click(); });
    const frame = container.querySelector('iframe');
    expect(frame).toHaveAttribute('src', PROJECT.embed);
    expect(frame.getAttribute('sandbox')).toContain('allow-scripts');
    expect(frame.getAttribute('sandbox')).not.toContain('allow-top-navigation');
    await act(async () => { screen.getByRole('button', { name: /Close the BBCA Forecast Desk demo/ }).click(); });
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('is only rendered for projects that have an embed', () => {
    const { container, rerender } = render(<Compact project={PROJECT} />);
    expect(container.querySelector('.demo')).not.toBeNull();
    rerender(<Compact project={{ ...PROJECT, embed: undefined }} />);
    expect(container.querySelector('.demo')).toBeNull();
  });
});
