import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Opening from './Opening.jsx';
import Premise from './Premise.jsx';
import StackExp from './StackExp.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';

describe('chapters', () => {
  it('Opening states the name and the headline', () => {
    render(<Opening />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building AI agents');
  });

  it('Premise keeps both metrics', () => {
    render(<Premise />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('StackExp lists every role and every tool group', () => {
    render(<StackExp />);
    expect(screen.getByText('Aksoro')).toBeInTheDocument();
    expect(screen.getByText('damirich.id')).toBeInTheDocument();
    expect(screen.getByText('AI / LLM')).toBeInTheDocument();
    expect(screen.getByText('Web & Infra')).toBeInTheDocument();
  });

  it('About keeps the UTC+7 line', () => {
    render(<About />);
    expect(screen.getByText(/UTC\+7/)).toBeInTheDocument();
  });

  it('Contact exposes email, LinkedIn and GitHub', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: /rizkynandapr@gmail\.com/ })).toHaveAttribute(
      'href', 'mailto:rizkynandapr@gmail.com'
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });
});
