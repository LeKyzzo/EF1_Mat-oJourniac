import Layout from "../components/Layout.jsx";

function NotFound() {
  return (
    <Layout>
      <main className="site-main">
        <section className="hero">
          <div className="container">
            <h1>Page introuvable</h1>
            <p className="hero__subtitle">
              La page que vous recherchez n&apos;existe pas. Utilisez la
              navigation pour revenir à l&apos;accueil.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default NotFound;
