import { useState } from 'react';
import WorkflowDiagram from './WorkflowDiagram';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Projects.css';

const APPLYIQ_FLOW = [
  { label: 'Webhook', detail: 'Resume upload triggers the pipeline. The file is parsed client-side with pdf.js or mammoth, so nothing leaves the browser as raw binary before this point.' },
  { label: 'Resume Screening AI', detail: 'First LLM pass reads the parsed text and pulls out structured fields — skills, years of experience, education, past titles.' },
  { label: 'Job Titles AI', detail: 'Takes the structured resume and proposes realistic job titles to search for, instead of relying on the user to guess the right keywords.' },
  { label: 'CV Improvement AI', detail: 'Runs alongside the job search — flags weak bullet points and rewrites them with the kind of quantified language recruiters actually skim for.' },
  { label: 'Google Jobs', detail: 'Generated titles become SerpAPI queries against live listings, so results are current instead of a static database.' },
  { label: 'Job Scoring AI', detail: 'Loops over every listing and scores fit against the resume, one item at a time.' },
  { label: 'Cover Letter AI', detail: 'For listings above the score threshold, drafts a tailored cover letter referencing the specific role and company — not a generic template.' },
  { label: 'Supabase', detail: 'Final row — resume, matched job, score, and letter — lands in Supabase and streams to the dashboard over Realtime.' },
];

const TALENTSCOUT_FLOW = [
  { label: 'Candidate CV', detail: "Input one: the candidate's CV, uploaded as a document. This is the raw material everything downstream works from." },
  { label: 'Job Description', detail: 'Input two: the complete job description text. Both inputs feed the same analysis step — the comparison only makes sense with both sides present.' },
  { label: 'Analyze Candidate', detail: 'An LLM prompted as a senior data scientist evaluates the CV against the job description — extracting structured data and running a gap analysis on requirements.' },
  { label: 'Weighted Scoring', detail: 'Fixed weights keep every candidate judged the same way: 40% hard skills, 30% experience, 20% education, 10% achievements. Out comes a single suitability score.' },
  { label: 'Hiring Dashboard', detail: 'Renders a corporate-style HTML dashboard — navy, white, grey — with candidate comparisons and interview recommendations a hiring manager can act on.' },
];

const PROJECTS = [
  {
    id: '01',
    name: 'ApplyIQ',
    tag: 'AI Job Application Assistant',
    period: 'May 2026 – Jul 2026',
    problem: "I got tired of doing the same three things for every job posting: reread my own resume, guess if I'm even a fit, then write a cover letter from scratch. So I automated it.",
    build: "Upload a resume, it gets parsed right in the browser — nothing sent anywhere until it's already text. An n8n pipeline takes it from there: pulls out your skills and experience, searches live job listings, scores each one against your profile, and drafts a cover letter for anything above the bar. Everything lands in Supabase and shows up on a dashboard with match scores you can actually skim.",
    stack: ['React 19', 'Vite', 'pdf.js', 'mammoth', 'n8n', 'Supabase', 'LLM'],
    links: { code: 'https://github.com/rizkynandapr/applyiq-web' },
    flow: APPLYIQ_FLOW,
    flowLabel: 'The pipeline, node by node',
  },
  {
    id: '02',
    name: 'TalentScout',
    tag: 'AI Recruitment Pipeline',
    period: 'Jun 2026',
    problem: "Screening CVs by hand doesn't scale, and two reviewers rarely agree on what 'qualified' means anyway.",
    build: "Two inputs — a candidate's CV and the job description — go through an LLM analysis step that extracts structured data and runs a gap analysis against the requirements. A weighted scoring engine turns that into a single suitability score, then the system renders an HTML dashboard comparing candidates and flagging who's worth an interview.",
    stack: ['Python', 'LLM Inference', 'Prompt Engineering', 'Workflow Automation', 'HTML'],
    links: { code: 'https://github.com/rizkynandapr/TalentScout-AI-Recruitment' },
    flow: TALENTSCOUT_FLOW,
    flowLabel: 'How a CV becomes a hiring decision',
  },
  {
    id: '03',
    name: 'Clickbait Detector',
    tag: 'NLP Headline Classifier',
    period: '2025',
    problem: "You can tell a clickbait headline in about half a second. Teaching a model to do the same, at scale, is the actual hard part.",
    build: "Trained an LSTM on roughly 32k balanced English headlines. It landed at 98% accuracy with 0.99 precision on the clickbait class — good enough that I put it behind a live Streamlit app so people could paste in a headline and get an answer instead of trusting the number blind.",
    stack: ['Python', 'TensorFlow', 'Keras', 'LSTM', 'Streamlit', 'Hugging Face'],
    links: {
      code: 'https://github.com/rizkynandapr/clickbait-detector',
      demo: 'https://huggingface.co/spaces/nandutt/clickbait_detektor',
    },
  },
];

export default function Projects() {
  const [active, setActive] = useState(0);
  const p = PROJECTS[active];
  const revealRef = useScrollReveal();

  return (
    <section id="work" className="section projects">
      <div className="section-head">
        <p className="section-eyebrow">Selected work</p>
        <h2 className="section-title">Three things I built<br />because the manual version got old.</h2>
      </div>

      <div className="projects-layout" ref={revealRef}>
        <div className="projects-list">
          {PROJECTS.map((proj, i) => (
            <button
              key={proj.id}
              className={`project-tab ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="project-tab-id mono">{proj.id}</span>
              <span className="project-tab-name">{proj.name}</span>
              <span className="project-tab-tag">{proj.tag}</span>
            </button>
          ))}
        </div>

        <div className="project-detail" key={p.id}>
          <div className="project-detail-header">
            <div>
              <h3>{p.name}</h3>
              <p className="project-period mono">{p.period}</p>
            </div>
            <div className="project-links">
              {p.links.demo && (
                <a href={p.links.demo} target="_blank" rel="noopener noreferrer" className="link-pill">
                  Live demo ↗
                </a>
              )}
              {p.links.code && (
                <a href={p.links.code} target="_blank" rel="noopener noreferrer" className="link-pill link-pill-ghost">
                  Code ↗
                </a>
              )}
            </div>
          </div>

          <div className="project-block">
            <p className="project-block-label mono">The problem</p>
            <p className="project-block-text">{p.problem}</p>
          </div>

          <div className="project-block">
            <p className="project-block-label mono">What I built</p>
            <p className="project-block-text">{p.build}</p>
          </div>

          <div className="project-stack">
            {p.stack.map((s) => (
              <span key={s} className="stack-chip mono">{s}</span>
            ))}
          </div>

          {p.flow && (
            <>
              <p className="project-block-label mono" style={{ marginTop: 34 }}>{p.flowLabel}</p>
              <WorkflowDiagram steps={p.flow} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
