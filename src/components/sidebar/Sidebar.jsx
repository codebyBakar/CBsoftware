import React, { useState } from "react";
import "./sidebar.css";
import { 
  FiHome,                    // Dashboard
  FiClipboard,                // Create-Order
  FiShoppingBag,              // All-Orders
  FiPackage,                  // Add-Products
  FiGrid,                     // All-Products
  FiFolder,                   // Add-Category
  FiLayers,                   // All-categories
  FiSettings,                 // Settings
  FiLogOut,                   // Logout
  FiMenu,                     // Menu toggle
  FiX,                        // Close toggle
  FiPlusCircle,               // Alternative for add
  FiList,                     // Alternative for lists
  FiTag,                      // Alternative for categories
} from "react-icons/fi";
import { TfiAngleLeft , TfiAngleRight } from "react-icons/tfi";

import { useNavigate, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    { icon: <FiHome size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <FiClipboard size={20} />, label: "Create-Order", path: "/create-order" },
    { icon: <FiShoppingBag size={20} />, label: "All-Orders", path: "/all-orders" },
    { icon: <FiPackage size={20} />, label: "Add-Products", path: "/add-product" },
    { icon: <FiGrid size={20} />, label: "All-Products", path: "/all-products" },
    { icon: <FiFolder size={20} />, label: "Add-Category", path: "/add-category" },
    { icon: <FiLayers size={20} />, label: "All-categories", path: "/all-categories" },
    
  ];

  return (
    <>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="SADA SUPER SHOP" className="logo-image" />
            {!collapsed && <span className="logo-text">SADA <br /><small>SUPER SHOP</small></span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {collapsed ? <TfiAngleRight  size={20} /> : <TfiAngleLeft size={20} />}
          </button>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.label}</span>}
              {collapsed && <span className="tooltip">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-links-end logout-btn">
            <span className="logout-icon"><FiLogOut size={20} /></span>
            {!collapsed && <span className="label">Logout</span>}
            {/* {collapsed && <span className="tooltip"></span>} */}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;