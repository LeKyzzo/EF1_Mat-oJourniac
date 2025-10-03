function TodoList({ todos = [], loading = false, onToggle }) {
  return (
    <ul
      className="todos__list"
      aria-live="polite"
      aria-busy={loading ? "true" : "false"}
    >
      {loading ? (
        <li className="empty-state">Chargement des tâches…</li>
      ) : todos.length === 0 ? (
        <li className="empty-state">Aucune tâche.</li>
      ) : (
        todos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item${todo.completed ? " done" : ""}`}
            data-id={todo.id}
          >
            <label className="todo-check">
              <input
                type="checkbox"
                checked={Boolean(todo.completed)}
                onChange={(event) => onToggle?.(todo.id, event.target.checked)}
                aria-label={`Marquer comme ${todo.completed ? "en cours" : "terminée"}`}
              />
              <span>✓</span>
            </label>
            <div className="todo-body">
              <p className="todo-title">{todo.title}</p>
              <div className="todo-meta">
                <span className="status">
                  <span className="status-dot" aria-hidden="true"></span>
                  {todo.completed ? "Terminée" : "En cours"}
                </span>
                <span>ID {todo.id}</span>
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  );
}

export default TodoList;
