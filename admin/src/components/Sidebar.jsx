import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FiPackage, FiList, FiShoppingCart } from "react-icons/fi";
import { AiTwotoneFileAdd } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import { LuList } from "react-icons/lu";
import { AdminDataContext } from "../context/AdminContext";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }) => {
  const { newOrders } = useContext(AdminDataContext);

  const menuItems = [
    { icon: <MdDashboard size={22} />, label: "Dashboard", path: "/" },
    { icon: <FiPackage size={22} />, label: "Add Items", path: "/add" },
    { icon: <FiList size={22} />, label: "List Items", path: "/lists" },
    { icon: <FiShoppingCart size={22} />, label: "View Orders", path: "/orders" },
    { icon: <AiTwotoneFileAdd size={22} />, label: "Add Blogs", path: "/add-blogs" },
    { icon: <LuList size={22} />, label: "View Blogs", path: "/blog-list" },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-md
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "w-20" : "w-64"}
        md:translate-x-0
      `}
    >
      {/* Top row: collapse button on the left, optional mobile close on the right */}
      <div className="w-full flex items-center justify-between px-2 py-2 border-b">
        {/* Collapse / Expand button - placed on the left inside the sidebar */}
        <button
          className="hidden md:inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* show compact arrows; when collapsed show '➡' (expand), else show '⬅' (collapse) */}
          <span className="text-3xl select-none bg-[#F0D800] text-[#710000] px-3 py-1 rounded">{collapsed ? <FaChevronCircleLeft /> : <FaChevronCircleRight />}</span>
        </button>

        {/* Mobile close button on the right (visible on small screens) */}
        <button
          className="md:hidden text-gray-600 hover:text-yellow-600 p-2"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Menu */}
      <div className="p-2 flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-lg transition relative
               ${isActive ? "text-[#710000] bg-[#F0D800] font-semibold shadow-sm"
                         : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"}`
            }
          >
            {item.icon}

            {/* label hidden when collapsed */}
            {!collapsed && <p>{item.label}</p>}

            {/* Notification Count */}
            {item.label === "View Orders" && newOrders.length > 0 && (
              <span className="ml-auto bg-red-600 text-white w-5 h-5 text-xs flex items-center justify-center rounded-full">
                {newOrders.length}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
