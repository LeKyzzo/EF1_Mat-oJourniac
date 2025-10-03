function Loader({ active, label = "Chargement" }) {
  return (
    <div
      id="loader"
      className={`loader ${active ? "active" : ""}`}
      aria-hidden={!active}
      role="status"
      aria-live="polite"
    >
      <span className="loader__spinner" aria-label={label}></span>
    </div>
  );
}

export default Loader;
