import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ItemDetails from "./pages/ItemDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/CheckOut";
import Orders from "./pages/Orders";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OurBlogs from "./pages/OurBlogs";

// Context
import { UserDataContext } from "./context/UserContext";

const App = () => {
  const { userData } = useContext(UserDataContext);

  return (
    <Router>
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/category/:category" element={<Products />} />
        <Route
          path="/products/category/:category/:subcategory"
          element={<Products />}
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/item/:slug" element={<ItemDetails />} />
        <Route path="/read-blogs/:id" element={<OurBlogs />} />

        {/* ---------- Cart Routes ---------- */}
        <Route path="/my-cart" element={<Cart />} />

        {/* ---------- Auth Routes ---------- */}
        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!userData ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" replace />}
        />

        {/* ---------- Protected Routes ---------- */}
        <Route
          path="/checkout"
          element={userData ? <Checkout /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/orders"
          element={userData ? <Orders /> : <Navigate to="/login" replace />}
        />

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
