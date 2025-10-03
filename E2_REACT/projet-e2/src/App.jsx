import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user/:userId" element={<UserDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
