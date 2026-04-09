import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiPackage, FiList, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { AiTwotoneFileAdd } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import { LuList } from "react-icons/lu";
import { AdminDataContext } from "../context/AdminContext";
import { FaChevronLeft, FaChevronRight, FaBell } from "react-icons/fa";
import { AuthDataContext } from "../context/AuthContext";
import axios from "axios";

const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }) => {
  const { newOrders, setAdminData } = useContext(AdminDataContext);
  const { baseUrl } = useContext(AuthDataContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`${baseUrl}/api/v1/auth/adminLogout`, { withCredentials: true });
      setAdminData(null);
      navigate("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const menuItems = [
    { icon: <MdDashboard size={20} />, label: "Dashboard", path: "/" },
    { icon: <FiPackage size={20} />, label: "Add Products", path: "/add" },
    { icon: <FiList size={20} />, label: "Product List", path: "/lists" },
    { 
      icon: <FiShoppingCart size={20} />, 
      label: "Orders", 
      path: "/orders",
      badge: newOrders.length > 0 ? newOrders.length : null
    },
    { icon: <AiTwotoneFileAdd size={20} />, label: "Add Blog", path: "/add-blogs" },
    { icon: <LuList size={20} />, label: "Blog List", path: "/blog-list" },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-white to-gray-50 shadow-xl
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "w-20" : "w-64"}
        md:translate-x-0
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b bg-white">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-gray-800">Admin</span>
          </div>
        )}
        
        <button
          className="hidden md:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <button
          className="md:hidden text-gray-600 hover:text-yellow-600 p-2"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
              ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold shadow-md"
                  : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
              }`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            
            {!collapsed && <span className="font-medium">{item.label}</span>}
            
            {item.badge && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >
          <FiLogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;