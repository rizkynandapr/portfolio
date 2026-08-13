import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Opening from './Opening.jsx';
import Premise from './Premise.jsx';
import StackExp from './StackExp.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import Compact from './Compact.jsx';

// Local fixture — pins Compact's contract, not the real PROJECTS data.
// Prose is invented and deliberately synthetic so it can't be mistaken for site copy.
const FIXTURE_PROJECT = {
  id: '99',
  name: 'Widget Sorter Zeta',
  tag: 'Fixture Tag for Testing',
  period: '1999 · Placeholder',
  problem: 'Zzyzx problem sentence used only to pin the Compact contract in tests.',
  build: 'Zzyzx build sentence used only to pin the Compact contract in tests.',
  stack: ['FixtureLang', 'FixtureFramework', 'FixtureTool'],
  links: {
    code: 'https://example.test/fixture-code',
    demo: 'https://example.test/fixture-demo',
  },
};

const FIXTURE_PROJECT_NO_DEMO = {
  ...FIXTURE_PROJECT,
  links: { code: 'https://example.test/fixture-code' },
};

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

  describe('Compact', () => {
    it('renders the project name, tag, and period', () => {
      render(<Compact project={FIXTURE_PROJECT} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(FIXTURE_PROJECT.name);
      expect(screen.getByText(FIXTURE_PROJECT.tag)).toBeInTheDocument();
      expect(screen.getByText(FIXTURE_PROJECT.period)).toBeInTheDocument();
    });

    it('renders both prose blocks', () => {
      render(<Compact project={FIXTURE_PROJECT} />);
      expect(screen.getByText(FIXTURE_PROJECT.problem)).toBeInTheDocument();
      expect(screen.getByText(FIXTURE_PROJECT.build)).toBeInTheDocument();
    });

    it('renders every entry in stack as a chip', () => {
      render(<Compact project={FIXTURE_PROJECT} />);
      FIXTURE_PROJECT.stack.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('renders a Code link pointing at project.links.code and a Live demo link pointing at project.links.demo', () => {
      render(<Compact project={FIXTURE_PROJECT} />);
      expect(screen.getByRole('link', { name: 'Code ↗' })).toHaveAttribute(
        'href', FIXTURE_PROJECT.links.code
      );
      expect(screen.getByRole('link', { name: 'Live demo ↗' })).toHaveAttribute(
        'href', FIXTURE_PROJECT.links.demo
      );
    });

    it('renders no Live demo link when links.demo is absent', () => {
      render(<Compact project={FIXTURE_PROJECT_NO_DEMO} />);
      expect(screen.queryByRole('link', { name: 'Live demo ↗' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Code ↗' })).toBeInTheDocument();
    });
  });
});
