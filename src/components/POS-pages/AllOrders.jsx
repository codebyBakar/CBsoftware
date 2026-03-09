import { useEffect, useState } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./allorders.css";
import { 
  FaSearch, 
  FaEye, 
  FaPrint, 
  FaCalendarAlt,
  FaDollarSign,
  FaBox,
  FaFilter,
  FaTimes,
  FaFileInvoice,
  FaDownload
} from "react-icons/fa";

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      }
    };

    handleSidebarChange();
    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter 
      ? new Date(order.createdAt).toISOString().slice(0,10) === dateFilter 
      : true;
    return matchesSearch && matchesDate;
  });

  const totalSales = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const clearFilters = () => {
    setSearch("");
    setDateFilter("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    const printContent = generateOrderReceipt(order);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateOrderReceipt = (order) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${order._id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .store-name {
            font-size: 20px;
            font-weight: bold;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .order-info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 5px;
          }
          td {
            padding: 5px;
          }
          .total {
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #000;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">SADA SUPER SHOP</div>
          <div>Order Receipt</div>
        </div>
        <div class="order-info">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Cashier:</strong> Admin User</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Subtotal: $${order.products.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</p>
          <p>Discount: -$${order.discount?.toFixed(2) || '0.00'}</p>
          <p>Tax: +$${order.tax?.toFixed(2) || '0.00'}</p>
          <p>Grand Total: $${order.totalAmount.toFixed(2)}</p>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer generated receipt</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>All Orders</h1>
              <p>Manage and track all customer orders</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="filters-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="clear-btn" onClick={() => setSearch("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="date-filter">
              <FaCalendarAlt className="date-icon" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="date-input"
              />
              {dateFilter && (
                <button className="clear-btn" onClick={() => setDateFilter("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            {(search || dateFilter) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <FaFilter /> Clear Filters
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaBox />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{filteredOrders.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Sales</span>
                <span className="stat-value">${totalSales.toFixed(2)}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaFileInvoice />
              </div>
              <div className="stat-info">
                <span className="stat-label">Average Order</span>
                <span className="stat-value">
                  ${filteredOrders.length > 0 
                    ? (totalSales / filteredOrders.length).toFixed(2) 
                    : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>

          {/* Orders Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <FaBox className="empty-icon" />
                <h3>No orders found</h3>
                <p>{search || dateFilter ? 'Try adjusting your filters' : 'No orders have been placed yet'}</p>
              </div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date & Time</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td className="order-id">
                        <span className="id-prefix">#</span>
                        {order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="order-date">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="order-total">
                        <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn view"
                          onClick={() => navigate(`/view-order/${order._id}`)}
                          title="View Order Details"
                        >
                          <FaEye /> View
                        </button>
                        <button 
                          className="action-btn print"
                          onClick={() => handlePrintOrder(order)}
                          title="Print Receipt"
                        >
                          <FaPrint /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllOrders;