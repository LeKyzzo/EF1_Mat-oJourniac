import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const desktopQuery = useMemo(
    () => window.matchMedia("(min-width: 781px)"),
    []
  );
  const [isDesktop, setIsDesktop] = useState(desktopQuery.matches);

  useEffect(() => {
    const handleResize = () => {
      const matches = desktopQuery.matches;
      setIsDesktop(matches);
      if (matches) setIsMenuOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [desktopQuery]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header" role="banner">
      <div className="container header__inner">
        <Link className="logo" to="/" aria-label="Retour à l'accueil">
          ESN<span>Portal</span>
        </Link>
        <button
          id="navToggle"
          className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="mainNav"
          aria-label="Menu principal"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="nav-toggle__bar"></span>
          <span className="nav-toggle__bar"></span>
          <span className="nav-toggle__bar"></span>
        </button>
        <nav
          id="mainNav"
          className={`main-nav ${isMenuOpen ? "open" : ""}`}
          role="navigation"
          aria-label="Navigation principale"
          hidden={!isDesktop && !isMenuOpen}
          aria-hidden={!isDesktop && !isMenuOpen}
        >
          <ul className="nav__list">
            <li>
              <Link
                className={`nav__link ${
                  location.pathname === "/" ? "active" : ""
                }`}
                to="/"
              >
                Accueil
              </Link>
            </li>
            <li>
              <a className="nav__link" href="#apropos" data-about>
                À propos
              </a>
            </li>
            <li>
              <a className="nav__link" href="#footer">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div
        id="navOverlay"
        className={`nav-overlay ${isMenuOpen ? "active" : ""}`}
        role="presentation"
        aria-hidden={!isMenuOpen}
        hidden={isDesktop || !isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      ></div>
    </header>
  );
}

export default Header;
