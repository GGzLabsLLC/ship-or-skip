export default function Privacy() {
  return (
    <section className="legal-page">
      <div className="hero-block hero-block--tight">
        <p className="hero-block__eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="hero-block__copy">
          This policy describes what information Ship or Skip may process and why.
        </p>
      </div>

      <div className="legal-panel">
        <h2>Information you submit</h2>
        <p>
          When you submit a project, we may process the information you provide,
          such as project name, tagline, category, link, and screenshot.
        </p>

        <h2>Usage and voting data</h2>
        <p>
          Ship or Skip may process basic usage and vote/ranking data needed to
          operate the battle and leaderboard experience (for example, wins/losses,
          vote counts, and rating updates).
        </p>

        <h2>Service providers</h2>
        <p>
          Ship or Skip uses Firebase services. Firebase hosting, storage, and
          database systems may process submitted project information and related
          operational data in order to provide the service.
        </p>

        <h2>Data retention</h2>
        <p>
          We may retain submitted project information for as long as the project is
          listed, and for a reasonable period afterward for safety, auditing, or
          operational reasons.
        </p>

        <h2>Your requests</h2>
        <p>
          If you want a submission removed or have privacy questions, contact{" "}
          <a className="legal-link" href="mailto:hello@shiporskip.app">
            hello@shiporskip.app
          </a>
          .
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. When we do, we will update
          the text on this page.
        </p>
      </div>
    </section>
  );
}

