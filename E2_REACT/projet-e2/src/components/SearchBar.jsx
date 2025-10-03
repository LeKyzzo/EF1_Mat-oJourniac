function SearchBar({ query, onQueryChange, onClear }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form
      id="searchForm"
      className="search"
      role="search"
      aria-label="Recherche utilisateurs ou tâches"
      onSubmit={handleSubmit}
    >
      <label htmlFor="searchInput" className="sr-only">
        Recherche
      </label>
      <input
        id="searchInput"
        name="q"
        type="search"
        placeholder="Rechercher un utilisateur ou une tâche..."
        autoComplete="off"
        aria-describedby="searchHelp"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <button
        type="button"
        id="clearSearch"
        aria-label="Effacer la recherche"
        onClick={onClear}
        style={{ display: query ? "inline-block" : "none" }}
      >
        ×
      </button>
    </form>
  );
}

export default SearchBar;
