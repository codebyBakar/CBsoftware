import React, { useState, useEffect } from "react";
import "./navbar.css";
import { FaBell, FaCircle, FaChevronDown, FaBox, FaShoppingBag, FaTag, FaDollarSign, FaUser, FaCheckCircle, FaTimesCircle, FaSpinner, FaClock } from "react-icons/fa";

function Navbar() {
  const [adminName, setAdminName] = useState("Admin Name");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Get admin name from storage
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    if (user.name) {
      setAdminName(user.name);
    }

    // Fetch initial notifications
    fetchNotifications();

    // Set up real-time updates every 30 seconds
    const notificationTimer = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(notificationTimer);
    };
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-wrapper') && !event.target.closest('.notifications-panel')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would fetch from your API
      // const response = await API.get("/api/notifications");
      // const data = response.data;
      
      // For demo purposes, generate mock notifications
      const mockNotifications = generateMockNotifications();
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = () => {
    const types = ['order', 'product', 'category', 'inventory', 'user'];
    const statuses = ['success', 'warning', 'info', 'pending'];
    const icons = {
      order: <FaShoppingBag />,
      product: <FaBox />,
      category: <FaTag />,
      inventory: <FaBox />,
      user: <FaUser />
    };
    
    const notifications = [];
    const now = new Date();
    
    // Generate last 10 notifications
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const minutesAgo = Math.floor(Math.random() * 60) + i * 30;
      const date = new Date(now);
      date.setMinutes(date.getMinutes() - minutesAgo);
      
      let title = '';
      let description = '';
      
      switch(type) {
        case 'order':
          title = `New Order #ORD-${Math.floor(1000 + Math.random() * 9000)}`;
          description = `Order total: $${(Math.random() * 500 + 50).toFixed(2)}`;
          break;
        case 'product':
          title = `Product ${Math.random() > 0.5 ? 'Added' : 'Updated'}`;
          description = `Product: ${['iPhone Case', 'Samsung Charger', 'Headphones', 'Mouse'][Math.floor(Math.random() * 4)]}`;
          break;
        case 'category':
          title = `Category ${Math.random() > 0.5 ? 'Created' : 'Modified'}`;
          description = `Category: ${['Electronics', 'Clothing', 'Books', 'Home'][Math.floor(Math.random() * 4)]}`;
          break;
        case 'inventory':
          title = 'Low Stock Alert';
          description = `${Math.floor(Math.random() * 5 + 1)} products are running low`;
          break;
        case 'user':
          title = 'New User Registered';
          description = `User: user${Math.floor(Math.random() * 100)}@example.com`;
          break;
      }
      
      notifications.push({
        id: i + 1,
        type,
        icon: icons[type],
        title,
        description,
        time: date,
        timeAgo: getTimeAgo(date),
        status,
        read: i > 3 ? true : Math.random() > 0.7,
        action: type === 'order' ? '/view-order/123' : null
      });
    }
    
    // Sort by date (newest first)
    return notifications.sort((a, b) => b.time - a.time);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      // Navigate to the relevant page
      // navigate(notification.action);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'pending': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <FaCircle className="status-dot" />
        <span className="welcome-text">Welcome back To </span><span className="logo-text" >SADA</span>
      </div>

      <div className="navbar-center">
        <div className="date-display">
          {/* <FaClock className="date-icon3" /> */}
          <span className="date">{formatDate(currentTime)}</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper" onClick={toggleNotifications}>
          <FaBell className={`bell-icon ${unreadCount > 0 ? 'has-notifications' : ''}`} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>

        <div className="admin-profile-wrapper">
          <div className="admin-avatar">
           
          </div>
          <div className="admin-details">
            <div className="admin-name">Admin Panel</div>
            {/* <div className="admin-role">
              Admin
              <FaChevronDown className="dropdown-icon" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <FaSpinner className="spinner" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <FaBell className="empty-icon" />
                <p>No notifications</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: `${getStatusColor(notification.status)}20`, color: getStatusColor(notification.status) }}
                    >
                      {notification.icon}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-description">{notification.description}</div>
                      <div className="notification-time">
                        <FaClock className="time-icon" />
                        {notification.timeAgo}
                      </div>
                    </div>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="notifications-footer">
            <button className="view-all-btn" onClick={() => {/* Navigate to all notifications */}}>
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;