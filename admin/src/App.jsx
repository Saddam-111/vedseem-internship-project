import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import Lists from "./pages/Lists";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { AdminDataContext } from "./context/AdminContext";
import Layout from "./components/Layout"; // Make sure this uses <Outlet />
import AddBlogs from "./pages/AddBlogs";
import BlogList from "./pages/BlogList";

const App = () => {
  const { adminData } = useContext(AdminDataContext);

  return (
    <Router>
      <Routes>
        {!adminData ? (
          <>
            {/* Show login route only if not logged in */}
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <>
            {/* Wrap all pages inside Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="add" element={<Add />} />
              <Route path="add-blogs" element={<AddBlogs />} />
              <Route path="blog-list" element={<BlogList />} />
              <Route path="lists" element={<Lists />} />
              <Route path="orders" element={<Orders />} />
              <Route path="login" element={<Navigate to="/" replace />} />
              {/* fallback to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
