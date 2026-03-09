import { useEffect, useState } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import "./vieworder.css";
import { 
  FaArrowLeft,
  FaBox,
  FaTag,
  FaPercentage,
  FaDollarSign,
  FaCalendarAlt,
  FaHashtag,
  FaUser,
  FaStore,
  FaShoppingBag,
  FaPrint,
  FaDownload,
  FaCheckCircle
} from "react-icons/fa";
import jsPDF from "jspdf";

function ViewOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generateReceiptHTML();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateReceiptHTML = () => {
    const date = new Date(order.createdAt);
    const subtotal = order.products.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumberDisplay = `ORD-${order._id.slice(-8).toUpperCase()}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${orderNumberDisplay}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', monospace;
            background: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          
          .receipt {
            max-width: 380px;
            width: 100%;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            overflow: hidden;
          }
          
          .receipt-header {
            background: linear-gradient(135deg, #4f46e5, #4338ca);
            color: white;
            padding: 24px;
            text-align: center;
          }
          
          .store-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .store-address {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 12px;
          }
          
          .receipt-title {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
            opacity: 0.9;
          }
          
          .receipt-body {
            padding: 24px;
          }
          
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px dashed #e5e7eb;
          }
          
          .info-left p, .info-right p {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .info-left strong, .info-right strong {
            color: #111827;
            font-size: 14px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .items-table th {
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .items-table td {
            padding: 8px 0;
            font-size: 12px;
            color: #111827;
            border-bottom: 1px dashed #f3f4f6;
          }
          
          .items-table td:last-child,
          .items-table th:last-child {
            text-align: right;
          }
          
          .item-name {
            font-weight: 500;
          }
          
          .item-qty {
            color: #6b7280;
            font-size: 11px;
          }
          
          .summary-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          
          .summary-row.total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #e5e7eb;
            font-weight: 700;
            font-size: 16px;
            color: #4f46e5;
          }
          
          .payment-info {
            text-align: center;
            padding-top: 16px;
            border-top: 2px dashed #e5e7eb;
          }
          
          .payment-method {
            font-weight: 600;
            color: #10b981;
            margin-bottom: 8px;
          }
          
          .thank-you {
            font-size: 11px;
            color: #9ca3af;
          }
          
          .receipt-footer {
            background: #f9fafb;
            padding: 16px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-text {
            font-size: 10px;
            color: #9ca3af;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .receipt {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="store-name">SADA SUPER SHOP</div>
            <div class="store-address">123 Main Street, City, State 12345</div>
            <div class="store-address">Phone: (555) 123-4567</div>
            <div class="receipt-title">SALES RECEIPT</div>
          </div>
          
          <div class="receipt-body">
            <div class="info-section">
              <div class="info-left">
                <p>Order Number</p>
                <strong>${orderNumberDisplay}</strong>
                <p style="margin-top: 8px;">Cashier</p>
                <strong>Admin User</strong>
              </div>
              <div class="info-right">
                <p>Date</p>
                <strong>${date.toLocaleDateString()}</strong>
                <p style="margin-top: 8px;">Time</p>
                <strong>${date.toLocaleTimeString()}</strong>
              </div>
            </div>
            
            <table class="items-table">
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
                    <td>
                      <span class="item-name">${item.name}</span>
                    </td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary-section">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Discount:</span>
                <span>$${order.discount?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>$${order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span>$${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="payment-info">
              <div class="payment-method">✓ PAID</div>
              <div class="thank-you">Thank you for shopping with us!</div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <div class="footer-text">
              This is a computer generated receipt<br>
              No signature required
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const date = new Date(order.createdAt);
    const subtotal = order.products.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumberDisplay = `ORD-${order._id.slice(-8).toUpperCase()}`;
    
    // Header background
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Store name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SADA SUPER SHOP", 105, 20, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("123 Main Street, City, State 12345", 105, 28, { align: "center" });
    doc.text("Phone: (555) 123-4567", 105, 33, { align: "center" });
    
    // Receipt title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SALES RECEIPT", 105, 45, { align: "center" });
    
    // Order info
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Order Number: ${orderNumberDisplay}`, 20, 55);
    doc.text(`Date: ${date.toLocaleDateString()}`, 20, 60);
    doc.text(`Time: ${date.toLocaleTimeString()}`, 20, 65);
    doc.text(`Cashier: Admin User`, 20, 70);
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    // Table headers
    doc.setFillColor(243, 244, 246);
    doc.rect(20, 80, 170, 8, 'F');
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Item", 22, 86);
    doc.text("Qty", 100, 86);
    doc.text("Price", 130, 86);
    doc.text("Total", 165, 86);
    
    let yPos = 95;
    
    // Table rows
    order.products.forEach((item) => {
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "normal");
      
      // Item name (truncate if too long)
      const itemName = item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name;
      doc.text(itemName, 22, yPos);
      doc.text(item.quantity.toString(), 102, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 130, yPos);
      doc.text(`$${item.subtotal.toFixed(2)}`, 165, yPos);
      
      yPos += 7;
    });
    
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Summary section
    doc.setFillColor(249, 250, 251);
    doc.rect(120, yPos - 5, 70, 40, 'F');
    
    doc.setFontSize(8);
    doc.text(`Subtotal:`, 125, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, 180, yPos, { align: "right" });
    
    yPos += 7;
    doc.text(`Discount:`, 125, yPos);
    doc.text(`-$${order.discount?.toFixed(2) || '0.00'}`, 180, yPos, { align: "right" });
    
    yPos += 7;
    doc.text(`Tax:`, 125, yPos);
    doc.text(`+$${order.tax?.toFixed(2) || '0.00'}`, 180, yPos, { align: "right" });
    
    yPos += 7;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.3);
    doc.line(125, yPos, 185, yPos);
    
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(`GRAND TOTAL:`, 125, yPos);
    doc.text(`$${order.totalAmount.toFixed(2)}`, 180, yPos, { align: "right" });
    
    // Payment info
    yPos = 170;
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text("✓ PAID", 105, yPos, { align: "center" });
    
    yPos += 5;
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Thank you for shopping with us!", 105, yPos, { align: "center" });
    
    // Footer
    yPos = 260;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 5;
    doc.setFontSize(6);
    doc.setTextColor(107, 114, 128);
    doc.text("This is a computer generated receipt - No signature required", 105, yPos, { align: "center" });
    
    doc.save(`receipt-${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
          <Navbar />
          <div className="dashboard-content">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
          <Navbar />
          <div className="dashboard-content">
            <div className="empty-state">
              <FaBox className="empty-icon" />
              <h3>Order not found</h3>
              <p>The order you're looking for doesn't exist</p>
              <button className="back-btn" onClick={() => navigate("/all-orders")}>
                <FaArrowLeft /> Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.products.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate("/all-orders")}>
                <FaArrowLeft /> Back to Orders
              </button>
              <div>
                <h1>Order Details</h1>
                <p>Order ID: #{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="header-actions">
              <button className="action-btn print" onClick={handlePrint}>
                <FaPrint /> Print Receipt
              </button>
              <button className="action-btn pdf" onClick={handleDownloadPDF}>
                <FaDownload /> Download PDF
              </button>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="order-info-grid">
            <div className="info-card">
              <FaHashtag className="card-icon" />
              <div className="card-content">
                <span className="card-label">Order ID</span>
                <span className="card-value">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
            <div className="info-card">
              <FaCalendarAlt className="card-icon" />
              <div className="card-content">
                <span className="card-label">Date</span>
                <span className="card-value">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {/* <div className="info-card">
              <FaUser className="card-icon" />
              <div className="card-content">
                <span className="card-label">Cashier</span>
                <span className="card-value">Admin User</span>
              </div>
            </div> */}
            <div className="info-card">
              <FaShoppingBag className="card-icon" />
              <div className="card-content">
                <span className="card-label">Total Items</span>
                <span className="card-value">{order.products.length}</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item, index) => (
                  <tr key={item.product || index}>
                    <td className="product-name">
                      <FaBox className="product-icon" />
                      {item.name}
                    </td>
                    <td className="quantity-cell">{item.quantity}</td>
                    <td className="price-cell">${item.price.toFixed(2)}</td>
                    <td className="subtotal-cell">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <FaShoppingBag className="summary-icon" />
                <h3>Subtotal</h3>
              </div>
              <div className="summary-amount">${subtotal.toFixed(2)}</div>
            </div>

            <div className="summary-card discount">
              <div className="card-header">
                <FaTag className="summary-icon" />
                <h3>Discount</h3>
              </div>
              <div className="summary-amount">- ${order.discount?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="summary-card tax">
              <div className="card-header">
                <FaPercentage className="summary-icon" />
                <h3>Tax</h3>
              </div>
              <div className="summary-amount">+ ${order.tax?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="summary-card total">
              <div className="card-header">
                <FaDollarSign className="summary-icon" />
                <h3>Grand Total</h3>
              </div>
              <div className="summary-amount">${order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="payment-status">
            <div className="payment-badge">
              <FaCheckCircle /> Payment Completed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewOrder;