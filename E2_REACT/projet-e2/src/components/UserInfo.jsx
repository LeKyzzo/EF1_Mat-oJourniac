// Je rassemble ici toutes les constantes dont j'ai besoin pour garder un rendu propre.
const DASH = "—";
const NBSP = "\u00A0";

function normalizeWebsite(url) {
  if (!url) {
    return { href: "", display: "" };
  }
  const hasProtocol = /^https?:\/\//i.test(url);
  const href = hasProtocol ? url : `http://${url}`;
  const display = url.replace(/^https?:\/\//i, "");
  return { href, display };
}

function formatLink(value, prefix) {
  if (!value) return "";
  return `${prefix}${encodeURIComponent(value)}`;
}

function display(value) {
  return value || DASH;
}

function UserInfo({ user, todos = [] }) {
  if (!user) return null;

  const username = user?.username || "";
  const companyName = user?.company?.name || "";
  const cityName = user?.address?.city || "";
  const street = user?.address?.street || "";
  const suite = user?.address?.suite || "";
  const zipcode = user?.address?.zipcode || "";
  const geoLat = user?.address?.geo?.lat || "";
  const geoLng = user?.address?.geo?.lng || "";
  const email = user?.email ? String(user.email) : "";
  const phone = user?.phone ? String(user.phone) : "";
  const website = user?.website ? String(user.website) : "";
  const catchPhrase = user?.company?.catchPhrase || "";
  const business = user?.company?.bs || "";

  const { href: websiteHref, display: websiteDisplay } =
    normalizeWebsite(website);
  const emailHref = formatLink(email, "mailto:");
  const phoneHref = formatLink(phone, "tel:");

  const todoCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  const subtitleParts = [];
  // J'utilise quelques séparateurs typographiques pour garder le même rendu qu'en statique.
  if (username) subtitleParts.push(`Pseudo${NBSP}: ${username}`);
  if (companyName) subtitleParts.push(`Entreprise${NBSP}: ${companyName}`);
  if (cityName) subtitleParts.push(`Ville${NBSP}: ${cityName}`);

  const subtitle = subtitleParts.join(" • ");

  const geoValue = geoLat && geoLng ? `${geoLat} / ${geoLng}` : DASH;

  return (
    <>
      <div className="user-info__header">
        <h2 className="user-info__title">{user.name}</h2>
        {/* Je n'affiche le sous-titre que si j'ai vraiment des infos pour éviter les lignes vides. */}
        {subtitle && <p className="user-info__subtitle">{subtitle}</p>}
      </div>

      <div className="user-info__grid">
        <article className="user-info__section">
          <h3>Coordonnées</h3>
          <ul className="user-info__list">
            <li>
              <span className="user-info__list-label">Email</span>
              {emailHref ? <a href={emailHref}>{email}</a> : DASH}
            </li>
            <li>
              <span className="user-info__list-label">Téléphone</span>
              {phoneHref ? <a href={phoneHref}>{phone}</a> : DASH}
            </li>
            <li>
              <span className="user-info__list-label">Site web</span>
              {websiteHref ? (
                <a href={websiteHref} target="_blank" rel="noopener noreferrer">
                  {websiteDisplay}
                </a>
              ) : (
                DASH
              )}
            </li>
            <li>
              <span className="user-info__list-label">
                Total tâches chargées
              </span>
              {todoCount}
            </li>
            <li>
              <span className="user-info__list-label">Tâches terminées</span>
              {completedCount}
            </li>
          </ul>
        </article>

        <article className="user-info__section">
          <h3>Adresse</h3>
          <ul className="user-info__list">
            <li>
              <span className="user-info__list-label">Rue</span>
              {display(street)}
            </li>
            <li>
              <span className="user-info__list-label">Complément</span>
              {display(suite)}
            </li>
            <li>
              <span className="user-info__list-label">Code postal</span>
              {display(zipcode)}
            </li>
            <li>
              <span className="user-info__list-label">Ville</span>
              {display(cityName)}
            </li>
            <li>
              <span className="user-info__list-label">Coordonnées GPS</span>
              {geoValue}
            </li>
          </ul>
        </article>

        <article className="user-info__section">
          <h3>Entreprise &amp; activité</h3>
          <ul className="user-info__list">
            <li>
              <span className="user-info__list-label">Nom</span>
              {display(companyName)}
            </li>
            <li>
              <span className="user-info__list-label">Slogan</span>
              {catchPhrase ? `« ${catchPhrase} »` : DASH}
            </li>
            <li>
              <span className="user-info__list-label">Spécialités</span>
              {display(business)}
            </li>
            <li>
              <span className="user-info__list-label">Identifiant interne</span>
              {String(user.id)}
            </li>
          </ul>
        </article>
      </div>
    </>
  );
}

export default UserInfo;
