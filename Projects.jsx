import { useState } from 'react';
import WorkflowDiagram from './WorkflowDiagram';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Projects.css';

const WA_CHATBOT_FLOW = [
  { label: 'WhatsApp Webhook', detail: 'A customer messages the business number and Meta pushes the event to n8n. A separate GET branch handles the one-time hub.challenge verification, so the same endpoint both registers and receives.' },
  { label: 'Config Klien', detail: 'Every client-specific value lives in this one node — WhatsApp token, Phone Number ID, Claude key, Sheet ID, owner number. Onboarding a new business means duplicating the workflow and editing here, nothing else.' },
  { label: 'Extract & Filter', detail: 'Pulls the sender, name, and text out of the webhook payload. Non-text events (images, voice notes) are filtered out politely instead of crashing the flow.' },
  { label: 'Read Chat History', detail: 'Grabs the last 6 exchanges for this customer from a Google Sheet, so the reply has context instead of treating every message like a cold open.' },
  { label: 'Claude API', detail: 'History plus the new message go to Claude with a per-business system prompt. The model is told to answer as customer service and to return structured JSON, not just prose.' },
  { label: 'Parse JSON', detail: 'The response is parsed into { reply, is_order, order }. This split is what lets one model call handle both conversation and order capture at the same time.' },
  { label: 'Reply + Log', detail: 'The reply goes back to the customer over the WhatsApp Cloud API, and the exchange is written to a ChatLog sheet while the lead record gets upserted for follow-up tracking.' },
  { label: 'Order → Notify Owner', detail: 'If is_order is true, the parsed order is appended to an Orders sheet and the owner gets an instant WhatsApp alert — the moment a sale is captured, a human knows.' },
  { label: 'Daily Follow-up (cron)', detail: 'A separate scheduled branch runs each morning, finds leads that went quiet for 24–72h, and sends an approved WhatsApp template to nudge them — the part owners forget to do by hand.' },
];

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
    name: 'WhatsApp AI Chatbot',
    tag: 'Universal n8n Template for SMBs',
    period: '2026 · Open source',
    problem: "My cousin makes raincoats, and every rainy season one person tries to answer a flood of WhatsApp orders by hand. Every small business here has some version of that, so I built the fix once as a template anyone can reuse.",
    build: "It turns a WhatsApp Business number into an AI agent that answers product questions with memory of the conversation, spots a complete order and drops it into Google Sheets, pings the owner right away, and chases up leads that went quiet. Everything client-specific sits in one config node, so standing it up for the next business takes under 30 minutes. No database server — just WhatsApp Cloud API, Claude, and Sheets. Open-sourced with the setup docs and the reasoning behind the architecture.",
    stack: ['n8n', 'WhatsApp Cloud API', 'Claude API', 'Google Sheets', 'Webhook'],
    links: { code: 'https://github.com/rizkynandapr/n8n-whatsapp-ai-chatbot' },
    flow: WA_CHATBOT_FLOW,
    flowLabel: 'One message in, node by node',
  },
  {
    id: '02',
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
    id: '03',
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
    id: '04',
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
