import { NavLink, useLocation } from "react-router-dom";

export default function Header({ onResetProjects, isAdmin = false }) {
  const location = useLocation();
  const isModerationRoute = location.pathname.startsWith("/moderation");
  const showResetSeason =
    isAdmin &&
    import.meta.env.DEV &&
    isModerationRoute &&
    typeof onResetProjects === "function";

  const navItems = [
    { to: "/battle", label: "Battle" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/submit", label: "Submit" },
  ];

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/battle" className="brand">
          <span className="brand-mark">⚡</span>
          <span className="brand-text">Ship or Skip</span>
        </NavLink>

        <div className="site-header__actions">
          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "site-nav__link is-active" : "site-nav__link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {showResetSeason ? (
            <button
              type="button"
              className="btn btn--secondary btn--md header-reset-btn"
              onClick={onResetProjects}
            >
              Reset season
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
