import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import UserInfo from "../components/UserInfo.jsx";
import TodoForm from "../components/TodoForm.jsx";
import TodoFilters from "../components/TodoFilters.jsx";
import TodoList from "../components/TodoList.jsx";
import { createTodo, getUser, getUserTodos } from "../services/api.js";

const INITIAL_FORM_STATUS = { state: "idle", message: "" };

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTitle, setFormTitle] = useState("");
  const [formCompleted, setFormCompleted] = useState(false);
  const [formStatus, setFormStatus] = useState(INITIAL_FORM_STATUS);

  useEffect(() => {
    document.body.dataset.page = "user";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    setActiveFilter("all");
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant.");
      return;
    }

    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [userData, todosData] = await Promise.all([
          getUser(userId),
          getUserTodos(userId),
        ]);

        if (isCancelled) return;

        setUser(userData);
        setTodos(Array.isArray(todosData) ? todosData : []);
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Impossible de charger l'utilisateur.");
          setUser(null);
          setTodos([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const filteredTodos = useMemo(() => {
    if (activeFilter === "open") {
      return todos.filter((todo) => !todo.completed);
    }
    if (activeFilter === "done") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [activeFilter, todos]);

  const handleTitleChange = (value) => {
    setFormTitle(value);
    if (formStatus.state !== "idle") {
      setFormStatus(INITIAL_FORM_STATUS);
    }
  };

  const handleCompletedChange = (value) => {
    setFormCompleted(value);
    if (formStatus.state !== "idle") {
      setFormStatus(INITIAL_FORM_STATUS);
    }
  };

  const handleFilterChange = (nextFilter) => {
    setActiveFilter(nextFilter);
  };

  const handleToggleTodo = useCallback((todoId, completed) => {
    setTodos((prev) =>
      prev.map((todo) =>
        Number(todo.id) === Number(todoId) ? { ...todo, completed } : todo
      )
    );
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = formTitle.trim();
    if (trimmedTitle.length < 3) {
      setFormStatus({ state: "error", message: "Titre trop court" });
      return;
    }
    if (trimmedTitle.length > 120) {
      setFormStatus({ state: "error", message: "Titre trop long" });
      return;
    }
    if (!userId) {
      setFormStatus({ state: "error", message: "Utilisateur introuvable" });
      return;
    }

    setFormStatus({ state: "loading", message: "Ajout en cours..." });

    try {
      const payload = {
        userId: Number(userId),
        title: trimmedTitle,
        completed: formCompleted,
      };

      const created = await createTodo(payload);

      const nextTodo = {
        ...created,
        userId: Number(userId),
        title: created?.title || trimmedTitle,
        completed: created?.completed ?? formCompleted,
      };

      setTodos((prev) => {
        const existingIds = prev.map((todo) => Number(todo.id) || 0);
        const maxId = existingIds.length ? Math.max(...existingIds) : 0;
        const providedId = Number(nextTodo.id) || 0;
        const hasProvidedId = providedId > 0 && !existingIds.includes(providedId);
        const safeId = hasProvidedId ? providedId : maxId + 1 || 1;
        const normalizedTodo = { ...nextTodo, id: safeId };
        return [normalizedTodo, ...prev];
      });

      setFormTitle("");
      setFormCompleted(false);
      setFormStatus({ state: "success", message: "Tâche ajoutée ✅" });
    } catch (err) {
      setFormStatus({
        state: "error",
        message: err.message || "Erreur lors de l'ajout",
      });
    }
  };

  const pageTitle = user?.name || (loading ? "Chargement du profil…" : "Utilisateur");
  const badgeCount = filteredTodos.length;

  return (
    <Layout loading={loading}>
      <main className="site-main" id="main">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <ol>
            <li>
              <Link to="/">Accueil</Link>
            </li>
            <li aria-current="page">{user?.name || "Utilisateur"}</li>
          </ol>
        </nav>

        {error ? (
          <section className="user-detail">
            <div className="container">
              <div className="empty-state" role="alert">
                {error}
              </div>
            </div>
          </section>
        ) : (
          <section className="user-detail" aria-labelledby="userTitle">
            <div className="container">
              <h1 id="userTitle">{pageTitle}</h1>
              <div className="user-detail__info" aria-live="polite">
                {user ? (
                  <UserInfo user={user} todos={todos} />
                ) : (
                  <p className="empty-state">Chargement du profil…</p>
                )}
              </div>
            </div>
          </section>
        )}

        {!error && (
          <section className="todos" aria-labelledby="todosTitle">
            <div className="container">
              <div className="todos__header">
                <h2 id="todosTitle">Tâches</h2>
                <span id="todoCount" className="badge" aria-live="polite">
                  {badgeCount}
                </span>
              </div>

              <TodoForm
                title={formTitle}
                completed={formCompleted}
                onTitleChange={handleTitleChange}
                onCompletedChange={handleCompletedChange}
                onSubmit={handleFormSubmit}
                status={formStatus}
              />

              <TodoFilters activeFilter={activeFilter} onChange={handleFilterChange} />

              <TodoList
                todos={filteredTodos}
                loading={loading && !todos.length}
                onToggle={handleToggleTodo}
              />
            </div>
          </section>
        )}

        <div className="back-wrapper container">
          <Link className="btn-secondary" to="/">
            ← Retour
          </Link>
        </div>
      </main>
    </Layout>
  );
}

export default UserDetail;
