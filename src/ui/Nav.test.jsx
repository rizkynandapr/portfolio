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
