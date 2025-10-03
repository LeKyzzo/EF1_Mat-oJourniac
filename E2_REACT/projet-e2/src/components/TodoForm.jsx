// Je garde ce formulaire contrôlé pour pouvoir valider côté client comme sur la version statique.
function TodoForm({
  title,
  completed,
  onTitleChange,
  onCompletedChange,
  onSubmit,
  status = { state: "idle", message: "" },
}) {
  const isLoading = status.state === "loading";
  // Je construis la classe dynamiquement pour réutiliser les styles success / error existants.
  const messageClass = ["form__msg"];
  if (status.state === "error") messageClass.push("error");
  if (status.state === "success") messageClass.push("success");

  return (
    <form className="todo-form" onSubmit={onSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="todoTitle">Nouvelle tâche</label>
        <input
          id="todoTitle"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="Intitulé de la tâche"
          aria-describedby="todoHelp"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={isLoading}
        />
        <p id="todoHelp" className="field-help">
          Entre 3 et 120 caractères.
        </p>
      </div>

      <div className="field-group field-inline">
        <label htmlFor="todoCompleted">Terminée ?</label>
        <input
          id="todoCompleted"
          name="completed"
          type="checkbox"
          checked={completed}
          onChange={(event) => onCompletedChange(event.target.checked)}
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={isLoading}>
        {isLoading ? "Ajout en cours…" : "Ajouter"}
      </button>

      {status.message && (
        <p
          className={messageClass.join(" ")}
          role="alert"
          aria-live="assertive"
        >
          {status.message}
        </p>
      )}
    </form>
  );
}

export default TodoForm;
