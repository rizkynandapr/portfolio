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

const FLAGGED_PROJECT = {
  id: '01',
  name: 'LegalitasAI',
  flagIndex: 1,
  flow: [
    { label: 'PDF Peraturan', detail: 'Regulations come as scanned PDFs.' },
    { label: 'Citation Validator', detail: 'Every citation gets checked.' },
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

  it('marks the flagged node as flag once it becomes the current step', async () => {
    const user = userEvent.setup();
    const { container } = render(<FlowStepper project={FLAGGED_PROJECT} />);
    await user.click(screen.getByRole('button', { name: /next node/i }));
    expect(container.querySelector(`[data-pane="${FLAGGED_PROJECT.flagIndex}"]`)).toHaveAttribute('data-state', 'flag');
  });

  it('dims the flagged node (does not flag it) while it is not the current step', () => {
    const { container } = render(<FlowStepper project={FLAGGED_PROJECT} />);
    const flagPane = container.querySelector(`[data-pane="${FLAGGED_PROJECT.flagIndex}"]`);
    expect(flagPane).toHaveAttribute('data-state', 'dim');
    expect(flagPane).not.toHaveAttribute('data-state', 'flag');
  });

  it('renders no flag pane for a project with no flagIndex, at any step', async () => {
    const user = userEvent.setup();
    const { container } = render(<FlowStepper project={PROJECT} />);
    expect(container.querySelector('[data-state="flag"]')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next node/i }));
    expect(container.querySelector('[data-state="flag"]')).not.toBeInTheDocument();
  });
});
