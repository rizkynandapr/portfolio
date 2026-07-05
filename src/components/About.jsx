import './About.css';

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="about-grid">
        <div>
          <p className="section-eyebrow">About</p>
          <p className="about-lead">
            IT degree from Universitas Muhammadiyah Yogyakarta, then Hacktiv8's
            Data Science Bootcamp on top of it. Automation on one side, data on
            the other.
          </p>
        </div>
        <div className="about-detail glass">
          <p>
            Most days I'm inside an n8n canvas or a prompt draft, wiring an AI
            agent to WhatsApp and waiting to see what breaks. Something always
            does — usually one node with a typo in its name, or a system prompt
            that reads fine to me and completely differently to the model.
            Finding that gap is most of the job.
          </p>
          <p>
            Open to remote work with international teams. I'm in UTC+7, which
            in practice means I've made peace with async standups.
          </p>
        </div>
      </div>
    </section>
  );
}
