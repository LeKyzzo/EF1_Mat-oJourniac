function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="site-footer" role="contentinfo">
      <div className="container footer__inner">
        <p>&copy; {year} ESN Portal. Projet pédagogique.</p>
      </div>
    </footer>
  );
}

export default Footer;
