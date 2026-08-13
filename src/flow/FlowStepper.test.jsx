import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlowStepper from './FlowStepper.jsx';

const PROJECT = {
  id: '01',
  name: 'LegalitasAI',
  flow: [
    { label: 'PDF Peraturan', detail: 'Regulations come as scanned PDFs.' },
    { label: 'Clean & Parse', detail: 'Boilerplate gets stripped.' },
    { label: 'Answer + Sources', detail: 'What ships is the answer.' },
  ],
};

describe('FlowStepper', () => {
  it('starts on the first node', () => {
    const { container } = render(<FlowStepper project={PROJECT} />);
    expect(container.querySelector('[data-pane="0"]')).toHaveAttribute('data-state', 'active');
  });

  it('advances one node per tap', async () => {
    const user = userEvent.setup();
    const { container } = render(<FlowStepper project={PROJECT} />);
    await user.click(screen.getByRole('button', { name: /next node/i }));
    expect(container.querySelector('[data-pane="1"]')).toHaveAttribute('data-state', 'active');
  });

  it('hides the next button on the last node', async () => {
    const user = userEvent.setup();
    render(<FlowStepper project={PROJECT} />);
    const next = screen.getByRole('button', { name: /next node/i });
    await user.click(next);
    await user.click(next);
    expect(screen.queryByRole('button', { name: /next node/i })).not.toBeInTheDocument();
  });

  it('keeps every node detail in the DOM', () => {
    render(<FlowStepper project={PROJECT} />);
    for (const n of PROJECT.flow) {
      expect(screen.getByText(n.detail)).toBeInTheDocument();
    }
  });
});
