// Je définis mes filtres ici pour les réutiliser facilement et garder l'ordre d'origine.
const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "open", label: "En cours" },
  { id: "done", label: "Terminées" },
];

function TodoFilters({ activeFilter, onChange }) {
  // Je me contente de boucler sur la configuration pour éviter de dupliquer le markup.
  return (
    <div
      className="todos__filters"
      role="group"
      aria-label="Filtrer les tâches"
    >
      {FILTERS.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <button
            key={filter.id}
            type="button"
            className={`filter-btn${isActive ? " active" : ""}`}
            data-filter={filter.id}
            aria-pressed={isActive}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default TodoFilters;
