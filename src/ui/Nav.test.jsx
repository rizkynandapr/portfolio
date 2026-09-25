import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Nav from './Nav.jsx';

describe('Nav', () => {
  it('exposes the four jump targets', () => {
    render(<Nav />);
    for (const label of ['Work', 'Stack', 'About']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('offers the CV as a download', () => {
    render(<Nav />);
    const cv = screen.getByRole('link', { name: 'CV ↓' });
    expect(cv).toHaveAttribute('href', '/Rizky-Nanda-Praditia-CV.pdf');
    expect(cv).toHaveAttribute('download');
  });

  it('links the wordmark back to the top', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Rizky Nanda' })).toHaveAttribute('href', '#top');
  });
});

describe('Nav mobile menu', () => {
  it('opens and closes, and closes after a link is picked', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const { container } = render(<Nav />);
    const btn = screen.getByRole('button', { name: 'Open menu' });
    expect(container.querySelector('#mobile-menu')).toHaveAttribute('hidden');

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#mobile-menu')).not.toHaveAttribute('hidden');

    fireEvent.click(container.querySelector('#mobile-menu a[href="#about"]'));
    expect(container.querySelector('#mobile-menu')).toHaveAttribute('hidden');
  });

  it('closes on Escape', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const { container } = render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(container.querySelector('#mobile-menu')).toHaveAttribute('hidden');
  });
});
