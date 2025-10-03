import { useEffect, useRef } from "react";
import UserCard from "./UserCard.jsx";

function UserList({ users, todosByUser, isSearching, loading = false }) {
  const containerRef = useRef(null);
  const hasResults = users.length > 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".user-card.reveal"));
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => {
      card.classList.remove("visible");
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [users]);

  if (loading) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        Chargement des utilisateurs…
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="empty-state" role="alert">
        {isSearching
          ? "Aucun profil ne correspond à votre recherche."
          : "Aucun utilisateur."}
      </div>
    );
  }

  return (
    <div
      id="usersGrid"
      className="users__grid"
      aria-live="polite"
      aria-busy="false"
      ref={containerRef}
    >
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          todos={todosByUser[user.id] || []}
        />
      ))}
    </div>
  );
}

export default UserList;
