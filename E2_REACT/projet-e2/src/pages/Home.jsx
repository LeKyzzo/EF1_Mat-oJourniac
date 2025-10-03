import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import SearchBar from "../components/SearchBar.jsx";
import UserList from "../components/UserList.jsx";
import { getUsers, getUserTodos } from "../services/api.js";

function Home() {
  const [users, setUsers] = useState([]);
  const [todosByUser, setTodosByUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.dataset.page = "home";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const userList = await getUsers();
        if (isCancelled) return;

        const todoEntries = await Promise.all(
          userList.map(async (user) => {
            try {
              const todos = await getUserTodos(user.id);
              return [user.id, todos];
            } catch (err) {
              console.error("Erreur lors du chargement des todos", err);
              return [user.id, []];
            }
          })
        );

        if (isCancelled) return;

        setUsers(userList);
        setTodosByUser(Object.fromEntries(todoEntries));
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Impossible de charger les utilisateurs.");
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
  }, []);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const filteredUsers = useMemo(() => {
    if (!isSearching) return users;

    return users.filter((user) => {
      const name = (user?.name || "").toLowerCase();
      const username = (user?.username || "").toLowerCase();
      const company = (user?.company?.name || "").toLowerCase();
      const city = (user?.address?.city || "").toLowerCase();
      const todos = todosByUser[user.id] || [];

      const hasTodoMatch = todos.some((todo) =>
        (todo?.title || "").toLowerCase().includes(trimmedQuery)
      );

      return (
        name.includes(trimmedQuery) ||
        username.includes(trimmedQuery) ||
        company.includes(trimmedQuery) ||
        city.includes(trimmedQuery) ||
        hasTodoMatch
      );
    });
  }, [isSearching, trimmedQuery, users, todosByUser]);

  return (
    <Layout loading={loading}>
      <main className="site-main" id="main">
        <section className="hero" aria-labelledby="heroTitle">
          <div className="container">
            <h1 id="heroTitle">Gestion centralisée des projets</h1>
            <p className="hero__subtitle" id="searchHelp">
              Consultez les utilisateurs, leurs projets et suivez l&apos;avancement des tâches.
            </p>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onClear={() => setQuery("")}
            />
          </div>
        </section>

        <section className="users" aria-labelledby="usersTitle">
          <div className="container">
            <h2 id="usersTitle">Utilisateurs &amp; projets</h2>
            {error ? (
              <div className="empty-state" role="alert">
                {error}
              </div>
            ) : (
              <UserList
                users={filteredUsers}
                todosByUser={todosByUser}
                isSearching={isSearching}
                loading={loading}
              />
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
