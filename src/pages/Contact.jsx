export default function Contact() {
  return (
    <section className="legal-page">
      <div className="hero-block hero-block--tight">
        <p className="hero-block__eyebrow">Support</p>
        <h1>Contact</h1>
        <p className="hero-block__copy">
          Get in touch for help, removals, or privacy questions.
        </p>
      </div>

      <div className="legal-panel">
        <h2>Email</h2>
        <p>
          Reach us at{" "}
          <a className="legal-link" href="mailto:hello@shiporskip.app">
            hello@shiporskip.app
          </a>
          .
        </p>

        <h2>Project removal requests</h2>
        <p>
          If you want a submission removed, include the project name and the link
          shown on Ship or Skip, plus any context that helps us locate it quickly.
        </p>

        <h2>Legal and privacy</h2>
        <p>
          For legal notices or privacy requests, email the address above with the
          subject line “Legal” or “Privacy”.
        </p>
      </div>
    </section>
  );
}

