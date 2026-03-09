import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import "./OrderSummary.css";
import { 
  FaSave, 
  FaPrint, 
  FaFilePdf, 
  FaArrowLeft,
  FaEdit,
  FaStore,
  FaCalendarAlt,
  FaHashtag,
  FaUser,
  FaBox,
  FaShoppingBag,
  FaTag,
  FaPercentage,
  FaDollarSign,
  FaCheckCircle,
  FaReceipt,
  FaDownload
} from "react-icons/fa";
import jsPDF from "jspdf";

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, discount, tax, grandTotal } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orderNumber, setOrderNumber] = useState(`ORD-${new Date().getTime()}`);

  // Redirect if no cart data
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate("/create-order");
    }
  }, [cart, navigate]);

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

  const handleSaveOrder = async () => {
    try {
      setLoading(true);
      const res = await API.post("/api/orders", {
        orderNumber,
        products: cart.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        discount,
        tax,
        totalAmount: grandTotal,
        orderDate: new Date()
      });
      alert("✅ Order Saved Successfully");
      navigate("/all-orders");
    } catch (error) {
      console.log(error);
      alert("❌ Error saving order");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generateReceiptHTML();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateReceiptHTML = () => {
    const date = new Date();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${orderNumber}</title>
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
                <strong>${orderNumber}</strong>
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
                ${cart.map(item => `
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
                <span>$${discount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span>$${grandTotal.toFixed(2)}</span>
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
    const date = new Date();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
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
    
    doc.text(`Order Number: ${orderNumber}`, 20, 55);
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
    cart.forEach((item) => {
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
    doc.text(`-$${discount.toFixed(2)}`, 180, yPos, { align: "right" });
    
    yPos += 7;
    doc.text(`Tax:`, 125, yPos);
    doc.text(`+$${tax.toFixed(2)}`, 180, yPos, { align: "right" });
    
    yPos += 7;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.3);
    doc.line(125, yPos, 185, yPos);
    
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(`GRAND TOTAL:`, 125, yPos);
    doc.text(`$${grandTotal.toFixed(2)}`, 180, yPos, { align: "right" });
    
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
    
    doc.save(`receipt-${orderNumber}.pdf`);
  };

  

  const calculateSubtotal = () => {
    return cart?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  };

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate("/create-order")}>
                <FaArrowLeft /> Back
              </button>
              <div>
                <h1>Order Summary</h1>
                <p>Review your order before saving</p>
              </div>
            </div>
            
            <div className="header-actions">
              {/* <button className="action-btn edit" onClick={handleEditCart}>
                <FaEdit /> Edit Cart
              </button> */}
              <button className="action-btn print" onClick={handlePrint}>
                <FaPrint /> Print Receipt
              </button>
              <button className="action-btn pdf" onClick={handleDownloadPDF}>
                <FaDownload /> Download PDF
              </button>
            </div>
          </div>

          <div className="receipt-preview">
            <div className="receipt-preview-header">
              <FaReceipt className="receipt-icon" />
              <h2>Receipt Preview</h2>
            </div>
            
            <div className="receipt-card">
              {/* Store Header */}
              <div className="receipt-store-header">
                <FaStore className="store-icon" />
                <h3>SADA SUPER SHOP</h3>
                <p>123 Main Street, City, State 12345</p>
                <p>Phone: (555) 123-4567</p>
                <div className="receipt-title">SALES RECEIPT</div>
              </div>

              {/* Order Info */}
              <div className="receipt-info-grid">
                <div className="info-block">
                  <div className="info-item">
                    <FaHashtag className="info-icon-small" />
                    <div>
                      <span className="info-label">Order Number</span>
                      <span className="info-value">{orderNumber}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaUser className="info-icon-small" />
                    <div>
                      <span className="info-label">Cashier</span>
                      <span className="info-value">Admin User</span>
                    </div>
                  </div>
                </div>
                <div className="info-block">
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon-small" />
                    <div>
                      <span className="info-label">Date</span>
                      <span className="info-value">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon-small" />
                    <div>
                      <span className="info-label">Time</span>
                      <span className="info-value">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="receipt-items">
                <table className="receipt-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.product || index}>
                        <td className="item-name-cell">
                          <span className="item-name">{item.name}</span>
                        </td>
                        <td className="item-qty">{item.quantity}</td>
                        <td className="item-price">${item.price.toFixed(2)}</td>
                        <td className="item-total">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="receipt-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row discount">
                  <span>
                    <FaTag className="summary-icon-small" /> Discount:
                  </span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
                <div className="summary-row tax">
                  <span>
                    <FaPercentage className="summary-icon-small" /> Tax:
                  </span>
                  <span>+ ${tax.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row grand-total">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="receipt-payment">
                <div className="payment-badge">✓ PAID</div>
                <p className="thank-you-text">Thank you for shopping with us!</p>
              </div>

              {/* Footer */}
              <div className="receipt-footer">
                <p>This is a computer generated receipt</p>
                <p>No signature required</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-actions">
            <button 
              className="secondary-btn"
              onClick={() => navigate("/create-order")}
            >
              <FaArrowLeft /> Back to Cart
            </button>
            <button 
              className="primary-btn"
              onClick={handleSaveOrder}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;