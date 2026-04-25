import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__name">Ship or Skip</div>
          <div className="site-footer__tagline">
            A voting arena for indie builds.
          </div>
          <div className="site-footer__disclaimer">
            Community-submitted projects. Ship or Skip does not endorse or
            guarantee listed projects.
          </div>
          <div className="site-footer__copyright">
            © 2026 Ship or Skip. All rights reserved.
          </div>
        </div>

        <nav className="site-footer__nav">
  <Link className="site-footer__link" to="/terms">Terms</Link>
  <span>•</span>
  <Link className="site-footer__link" to="/privacy">Privacy</Link>
  <span>•</span>
  <Link className="site-footer__link" to="/cookies">Cookies</Link>
  <span>•</span>
  <Link className="site-footer__link" to="/contact">Contact</Link>
</nav>
      </div>
    </footer>
  );
}