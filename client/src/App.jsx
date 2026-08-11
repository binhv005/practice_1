import { Routes, Route, Navigate } from "react-router-dom";
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />

      <Route path="/products" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
