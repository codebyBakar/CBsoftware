import React, { useState, useEffect } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import "./Dashboard.css";
import { 
  FaDollarSign, 
  FaBox, 
  FaTags, 
  FaShoppingBag,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine
} from "react-icons/fa";

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    recentOrders: [],
    salesData: [],
    categoryDistribution: [],
    topProducts: [],
    todayStats: {
      sales: 0,
      orders: 0
    },
    weeklyComparison: {
      current: 0,
      previous: 0,
      percentage: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      }
    };

    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        productsRes,
        categoriesRes,
        ordersRes
      ] = await Promise.all([
        API.get("/api/products"),
        API.get("/api/categories"),
        API.get("/api/orders")
      ]);

      const products = productsRes.data || [];
      const categories = categoriesRes.data || [];
      const orders = ordersRes.data || [];

      // console.log("Fetched data:", { products, categories, orders }); // Debug log

      // Calculate total sales
      const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Calculate today's stats
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < tomorrow;
      });

      const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Generate sales data for chart based on time range
      const salesData = generateSalesData(orders, timeRange);

      // Calculate category distribution
      const categoryDistribution = categories.map(cat => ({
        name: cat.name || 'Uncategorized',
        value: products.filter(p => p.category?._id === cat._id).length
      })).filter(cat => cat.value > 0);

      // Get top products by sales
      const productSales = {};
      orders.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(item => {
            const productId = item.product || item._id;
            if (!productSales[productId]) {
              productSales[productId] = {
                name: item.name || 'Unknown Product',
                quantity: 0,
                revenue: 0
              };
            }
            productSales[productId].quantity += item.quantity || 0;
            productSales[productId].revenue += item.subtotal || 0;
          });
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate weekly comparison
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const currentWeekSales = orders
        .filter(order => new Date(order.createdAt) >= lastWeek)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      const previousWeek = new Date(lastWeek);
      previousWeek.setDate(previousWeek.getDate() - 7);
      
      const previousWeekSales = orders
        .filter(order => {
          const date = new Date(order.createdAt);
          return date >= previousWeek && date < lastWeek;
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const weeklyPercentage = previousWeekSales > 0 
        ? ((currentWeekSales - previousWeekSales) / previousWeekSales * 100).toFixed(1)
        : currentWeekSales > 0 ? 100 : 0;

      // Get recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          ...order,
          id: order._id ? order._id.slice(-8).toUpperCase() : 'N/A',
          timeAgo: getTimeAgo(new Date(order.createdAt))
        }));

      // Check for alerts
      const newAlerts = [];
      
      // Low stock alert
      const lowStockProducts = products.filter(p => p.quantity <= 5);
      if (lowStockProducts.length > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${lowStockProducts.length} product(s) are low in stock`,
          icon: <FaExclamationTriangle />
        });
      }

      // No orders alert
      if (orders.length === 0) {
        newAlerts.push({
          type: 'info',
          message: 'No orders have been placed yet',
          icon: <FaShoppingBag />
        });
      }

      setDashboardData({
        totalSales,
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        recentOrders,
        salesData,
        categoryDistribution,
        topProducts,
        todayStats: {
          sales: todaySales,
          orders: todayOrders.length
        },
        weeklyComparison: {
          current: currentWeekSales,
          previous: previousWeekSales,
          percentage: weeklyPercentage
        }
      });

      setAlerts(newAlerts);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Show error alert
      setAlerts([{
        type: 'error',
        message: 'Failed to load dashboard data. Please refresh the page.',
        icon: <FaExclamationTriangle />
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Generate sales data for charts
  const generateSalesData = (orders, range) => {
    const data = [];
    const now = new Date();
    
    if (!orders || orders.length === 0) {
      // Return empty data structure
      for (let i = 0; i < 7; i++) {
        data.push({ name: 'Day ' + (i+1), sales: 0, orders: 0 });
      }
      return data;
    }
    
    switch(range) {
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          const daySales = orders
            .filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= date && orderDate < nextDate;
            })
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          
          data.push({
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: daySales,
            orders: orders.filter(o => {
              const orderDate = new Date(o.createdAt);
              return orderDate >= date && orderDate < nextDate;
            }).length
          });
        }
        break;
        
      case 'month':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          
          if (i % 5 === 0) {
            const daySales = orders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === date.toDateString();
              })
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
            data.push({
              name: date.getDate().toString(),
              sales: daySales
            });
          }
        }
        break;
        
      case 'year':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
          
          const monthSales = orders
            .filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= date && orderDate < nextMonth;
            })
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            sales: monthSales
          });
        }
        break;
        
      default:
        break;
    }
    
    return data;
  };

  // Get time ago string
  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';
    
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
    
    return Math.floor(seconds) + ' seconds ago';
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const StatCard = ({ title, value, icon, change, color, prefix = '', suffix = '' }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-main">
          <span className="stat-value">{prefix}{formatNumber(value)}{suffix}</span>
          {change !== undefined && (
            <span className={`stat-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}`}>
              {change > 0 ? <FaArrowUp /> : change < 0 ? <FaArrowDown /> : null}
              {change !== 0 ? Math.abs(change) + '%' : '0%'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const AlertBanner = ({ alert, onClose }) => (
    <div className={`alert-banner ${alert.type}`}>
      <span className="alert-icon">{alert.icon}</span>
      <span className="alert-message">{alert.message}</span>
      <button className="alert-close" onClick={onClose}>×</button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          {/* Header with time range selector and last updated */}
          <div className="dashboard-header">
            <div className="header-title">
              <h1>Dashboard Overview</h1>
              <p>Welcome back! Here's your store performance</p>
            </div>
            
            <div className="header-controls">
              <div className="time-range-selector">
                <button 
                  className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </button>
                <button 
                  className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </button>
                <button 
                  className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
                  onClick={() => setTimeRange('year')}
                >
                  Year
                </button>
              </div>
              
              <div className="last-updated">
                <FaClock />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="alerts-container">
              {alerts.map((alert, index) => (
                <AlertBanner 
                  key={index} 
                  alert={alert} 
                  onClose={() => setAlerts(alerts.filter((_, i) => i !== index))}
                />
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-overlay">
              <FaSpinner className="spinner" />
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Main Stats Cards */}
              <div className="stats-grid">
                <StatCard
                  title="Total Sales"
                  value={dashboardData.totalSales}
                  icon={<FaDollarSign />}
                  // change={parseFloat(dashboardData.weeklyComparison.percentage)}
                  color="#4f46e5"
                  prefix="$"
                />
                
                <StatCard
                  title="Total Orders"
                  value={dashboardData.totalOrders}
                  icon={<FaShoppingBag />}
                  color="#10b981"
                />
                
                <StatCard
                  title="Total Products"
                  value={dashboardData.totalProducts}
                  icon={<FaBox />}
                  color="#f59e0b"
                />
                
                <StatCard
                  title="Categories"
                  value={dashboardData.totalCategories}
                  icon={<FaTags />}
                  color="#8b5cf6"
                />
              </div>

              {/* Today's Mini Stats */}
              <div className="today-stats">
                <div className="today-stat-card">
                  <FaChartLine className="today-icon" />
                  <div>
                    <span className="today-label">Today's Sales</span>
                    <span className="today-value">{formatCurrency(dashboardData.todayStats.sales)}</span>
                  </div>
                </div>
                <div className="today-stat-card">
                  <FaShoppingBag className="today-icon" />
                  <div>
                    <span className="today-label">Today's Orders</span>
                    <span className="today-value">{dashboardData.todayStats.orders}</span>
                  </div>
                </div>
                <div className="today-stat-card">
                  <FaArrowUp className="today-icon" />
                  <div>
                    <span className="today-label">vs Last Week</span>
                    <span className="today-value">
                      {dashboardData.weeklyComparison.percentage > 0 ? '+' : ''}
                      {dashboardData.weeklyComparison.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                {/* Sales Trend Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Sales Trend</h3>
                    <div className="chart-legend">
                      <span className="legend-item">
                        <span className="legend-color" style={{ background: '#4f46e5' }}></span>
                        Sales
                      </span>
                    </div>
                  </div>
                  <div className="chart-container">
                    {dashboardData.salesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dashboardData.salesData}>
                          <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#4f46e5" 
                            strokeWidth={2}
                            fill="url(#salesGradient)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-chart-data">
                        <FaChartLine className="no-data-icon" />
                        <p>No sales data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Products by Category</h3>
                  </div>
                  <div className="chart-container">
                    {dashboardData.categoryDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dashboardData.categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {dashboardData.categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-chart-data">
                        <FaTags className="no-data-icon" />
                        <p>No categories with products</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Products Chart */}
                <div className="chart-card full-width">
                  <div className="chart-header">
                    <h3>Top Products by Revenue</h3>
                  </div>
                  <div className="chart-container">
                    {dashboardData.topProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.topProducts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-chart-data">
                        <FaBox className="no-data-icon" />
                        <p>No product sales data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="recent-orders-section">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => navigate('/all-orders')}
                  >
                    View All Orders <FaEye />
                  </button>
                </div>
                
                <div className="table-container">
                  {dashboardData.recentOrders.length > 0 ? (
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                         
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentOrders.map((order) => (
                          <tr key={order._id} onClick={() => navigate(`/view-order/${order._id}`)}>
                            <td className="order-id">#{order.id}</td>
                            <td className="order-date">
                              <FaCalendarAlt className="table-icon" />
                              {new Date(order.createdAt).toLocaleDateString()}
                              <span className="time-ago">{order.timeAgo}</span>
                            </td>
                            <td className="order-items">{order.products?.length || 0} items</td>
                            <td className="order-total">{formatCurrency(order.totalAmount)}</td>
                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-orders">
                      <FaShoppingBag className="no-orders-icon" />
                      <h3>No orders yet</h3>
                      <p>Orders will appear here once customers start shopping</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;