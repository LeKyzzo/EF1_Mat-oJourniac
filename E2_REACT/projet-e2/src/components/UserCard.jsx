import { Link } from "react-router-dom";

// Je recompose la carte utilisateur pour afficher les infos clés comme sur la version HTML d'origine.

function formatLink(href, fallback = "—") {
  if (!href) return fallback;
  return href;
}

function normalizeWebsite(url) {
  if (!url) return { href: "", display: "" };
  const hasProtocol = /^https?:\/\//i.test(url);
  const href = hasProtocol ? url : `http://${url}`;
  const display = url.replace(/^https?:\/\//i, "");
  return { href, display };
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function UserCard({ user, todos = [] }) {
  // Je calcule le nombre de tâches terminées pour alimenter le badge.
  const completedCount = todos.filter((todo) => todo.completed).length;
  const firstTodos = todos.slice(0, 3);

  const companyName = user?.company?.name || "Entreprise";
  const username = user?.username || "";
  const cityName = user?.address?.city || "";
  const email = user?.email ? String(user.email) : "";
  const phone = user?.phone ? String(user.phone) : "";
  const website = user?.website ? String(user.website) : "";
  const catchPhrase = user?.company?.catchPhrase || "";
  const business = user?.company?.bs || "";

  const { href: websiteHref, display: websiteDisplay } =
    normalizeWebsite(website);
  const emailHref = email ? `mailto:${encodeURIComponent(email)}` : "";
  const phoneHref = phone ? `tel:${encodeURIComponent(phone)}` : "";

  const tags = [];
  if (business) {
    // Je conserve le tag business en premier pour coller au design initial.
    tags.push(
      <li key="business" className="user-card__tag">
        {business}
      </li>
    );
  }
  firstTodos.forEach((todo) => {
    // Je limite chaque todo à 26 caractères pour éviter de casser la grille responsive.
    tags.push(
      <li key={todo.id} className="user-card__tag user-card__tag--todo">
        {truncate(todo.title, 26)}
      </li>
    );
  });
  if (websiteHref) {
    tags.push(
      <li key="website" className="user-card__tag user-card__tag--link">
        {websiteDisplay}
      </li>
    );
  }

  return (
    <article className="user-card reveal">
      <div className="user-card__header">
        <div>
          <h3 className="user-card__title">{user.name}</h3>
          <div className="user-card__company">{companyName}</div>
        </div>
        <span
          className="badge"
          aria-label={`${completedCount} tâches terminées`}
        >
          {completedCount}
        </span>
      </div>

      <ul className="user-card__meta">
        <li className="user-card__meta-item">
          <span className="user-card__meta-label">Pseudo</span>
          <span className="user-card__meta-value">{username || "—"}</span>
        </li>
        <li className="user-card__meta-item">
          <span className="user-card__meta-label">Ville</span>
          <span className="user-card__meta-value">{cityName || "—"}</span>
        </li>
        <li className="user-card__meta-item">
          <span className="user-card__meta-label">Email</span>
          <span className="user-card__meta-value">
            {emailHref ? <a href={formatLink(emailHref)}>{email}</a> : "—"}
          </span>
        </li>
        <li className="user-card__meta-item">
          <span className="user-card__meta-label">Téléphone</span>
          <span className="user-card__meta-value">
            {phoneHref ? <a href={formatLink(phoneHref)}>{phone}</a> : "—"}
          </span>
        </li>
        <li className="user-card__meta-item">
          <span className="user-card__meta-label">Site web</span>
          <span className="user-card__meta-value">
            {websiteHref ? (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer">
                {websiteDisplay}
              </a>
            ) : (
              "—"
            )}
          </span>
        </li>
      </ul>

      <p className="user-card__catch">
        {catchPhrase
          ? `« ${catchPhrase} »`
          : "Slogan indisponible pour cette entreprise."}
      </p>

      {tags.length > 0 && (
        <ul className="user-card__tags" aria-label="Points clés utilisateur">
          {tags}
        </ul>
      )}

      <Link
        className="user-card__full"
        to={`/user/${user.id}`}
        aria-label={`Voir le détail de ${user.name}`}
      >
        Voir le détail
      </Link>
    </article>
  );
}

export default UserCard;
