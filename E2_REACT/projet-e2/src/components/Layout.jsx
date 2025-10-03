import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Loader from "./Loader.jsx";

function Layout({ children, loading = false }) {
  return (
    <>
      <Loader active={loading} />
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default Layout;
