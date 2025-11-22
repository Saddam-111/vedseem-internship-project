import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main
          className={`
            flex-1 overflow-y-scroll scrollbar-hide transition-all duration-300 bg-white
            ${collapsed ? "ml-2 lg:ml-20" : "ml-4"}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
