import './chapters.css';

// The only --press surface on the site: paper inverts to ink.
export default function Contact() {
  return (
    <section id="contact" className="chapter chapter-dark chapter-contact">
      <p className="chapter-mark mono">Contact</p>

      <h2 className="contact-title">
        Have a broken workflow<br />or an idea worth automating?
      </h2>

      <a href="mailto:rizkynandapr@gmail.com" className="contact-email mono">
        rizkynandapr@gmail.com
      </a>

      <p className="contact-links">
        <a href="https://www.linkedin.com/in/rizky-nanda-praditia/" target="_blank" rel="noopener noreferrer" className="mono">LinkedIn</a>
        <a href="https://github.com/rizkynandapr" target="_blank" rel="noopener noreferrer" className="mono">GitHub</a>
        <a href="/Rizky-Nanda-Praditia-CV.pdf" download className="mono">CV ↓</a>
      </p>

      <p className="contact-foot mono">
        © 2026 Rizky Nanda Praditia · React + GSAP · Deployed on Vercel
      </p>
    </section>
  );
}
