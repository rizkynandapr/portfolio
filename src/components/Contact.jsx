import './Contact.css';

export default function Contact() {
  return (
    <footer id="contact" className="contact">
      <div className="contact-inner">
        <p className="section-eyebrow contact-eyebrow">Contact</p>
        <h2 className="contact-title">
          Have a broken workflow<br />or an idea worth automating?
        </h2>
        <a href="mailto:rizkynandapr@gmail.com" className="contact-email mono">
          rizkynandapr@gmail.com
        </a>
        <div className="contact-links">
          <a href="mailto:rizkynandapr@gmail.com">Email</a>
          <a href="https://www.linkedin.com/in/rizky-nanda-praditia/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/rizkynandapr" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="contact-foot mono">© 2026 Rizky Nanda Praditia · React + Three.js · Deployed on Vercel</p>
      </div>
    </footer>
  );
}
