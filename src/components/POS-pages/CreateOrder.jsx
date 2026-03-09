import { useEffect, useState } from "react";
import { API, BASE_URL } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./createorder.css";
import { 
  FaShoppingCart, 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaTag, 
  FaPercentage, 
  FaBox,
  FaImage,
  FaCheckCircle,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";

function CreateOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const navigate = useNavigate();

  // Sidebar collapse state
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

  // Auto-expand cart when items are added
  useEffect(() => {
    if (cart.length > 0) {
      setIsCartExpanded(true);
    }
  }, [cart.length]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/products");
        // Filter only active products
        const activeProducts = res.data.filter(p => p.status === 'active');
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/api/categories");
        setCategories(res.data.filter(c => c.status === 'active'));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existing = cart.find((p) => p.product === product._id);
    if (existing) {
      setCart(cart.map((p) => 
        p.product === product._id 
          ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.price } 
          : p
      ));
    } else {
      setCart([...cart, { 
        product: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        subtotal: product.price,
        image: product.image
      }]);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(p => 
      p.product === id 
        ? { ...p, quantity: qty, subtotal: qty * p.price } 
        : p
    ));
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(p => p.product !== id);
    setCart(newCart);
    // Collapse cart if it becomes empty
    if (newCart.length === 0) {
      setIsCartExpanded(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setTaxPercent(0);
    setIsCartExpanded(false);
  };

  const toggleCart = () => {
    if (cart.length > 0) {
      setIsCartExpanded(!isCartExpanded);
    }
  };

  const totalAmount = cart.reduce((sum, p) => sum + p.subtotal, 0);
  
  // Calculate discount and tax amounts based on percentages
  const discountAmount = (totalAmount * discountPercent) / 100;
  const taxAmount = (totalAmount * taxPercent) / 100;
  const grandTotal = totalAmount - discountAmount + taxAmount;

  const handlePlaceOrder = () => {
    navigate("/order-summary", { 
      state: { 
        cart, 
        discount: discountAmount, 
        discountPercent,
        tax: taxAmount,
        taxPercent,
        grandTotal 
      } 
    });
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Create New Order</h1>
              <p>Select products to add to cart</p>
            </div>
            
            {/* Cart Toggle Button (visible when cart has items) */}
            {cart.length > 0 && (
              <button 
                className={`cart-toggle-btn ${isCartExpanded ? 'expanded' : ''}`}
                onClick={toggleCart}
              >
                {isCartExpanded ? <FaChevronUp /> : <FaChevronDown />}
                <FaShoppingCart />
                <span className="cart-count">{cart.length}</span>
              </button>
            )}
          </div>

          <div className="order-layout">
            {/* Products Section - Top */}
            <div className="products-section">
              <div className="products-header">
                <h2>
                  <FaBox className="section-icon" />
                  Available Products
                </h2>
                
                <div className="product-filters">
                  <div className="search-wrapper">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  
                  <select 
                    className="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        {!imageErrors[product._id] && product.image ? (
                          <img 
                            src={`${BASE_URL}/uploads/${product.image}`} 
                            alt={product.name}
                            onError={() => handleImageError(product._id)}
                          />
                        ) : (
                          <div className="no-image">
                            <FaImage />
                          </div>
                        )}
                        {product.quantity <= 0 && (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">${product.price.toFixed(2)}</p>
                        <p className="product-stock">
                          Stock: <span className={product.quantity <= 5 ? 'low-stock' : ''}>
                            {product.quantity}
                          </span>
                        </p>
                      </div>
                      
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.quantity <= 0}
                      >
                        <FaPlus /> Add Item
                      </button>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && !loading && (
                    <div className="no-products">
                      <FaBox className="no-products-icon" />
                      <h3>No products found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Section - Bottom (Collapsible) */}
            <div className={`cart-section-wrapper ${isCartExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="cart-section">
                <div className="cart-header">
                  <h2>
                    <FaShoppingCart className="section-icon" />
                    Shopping Cart
                  </h2>
                  {cart.length > 0 && (
                    <button className="clear-cart-btn" onClick={clearCart}>
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <FaShoppingCart className="empty-cart-icon" />
                    <h3>Your cart is empty</h3>
                    <p>Add products from above</p>
                  </div>
                ) : (
                  <div className="cart-content">
                    {/* Cart Items - Left Side */}
                    <div className="cart-items-container">
                      <div className="cart-items">
                        {cart.map((item) => (
                          <div key={item.product} className="cart-item">
                            <div className="cart-item-info">
                              <h4>{item.name}</h4>
                              <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                            </div>
                            
                            <div className="cart-item-controls">
                              <div className="quantity-control">
                                <button 
                                  className="qty-btn"
                                  onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                >
                                  <FaMinus />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  min="1"
                                  onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
                                  className="qty-input"
                                />
                                <button 
                                  className="qty-btn"
                                  onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                              
                              <span className="cart-item-subtotal">
                                ${item.subtotal.toFixed(2)}
                              </span>
                              
                              <button 
                                className="remove-item-btn"
                                onClick={() => removeFromCart(item.product)}
                                title="Remove item"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cart Summary - Right Side */}
                    <div className="cart-summary-container">
                      <div className="cart-summary">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-row discount-input">
                          <label>
                          Discount:
                          </label>
                          <div className="input-wrappers">
                            <input
                              type="number"
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="0"
                            />
                            <span>%</span>
                          </div>
                          <span className="calculated-amount">
                            - ${discountAmount.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="summary-row tax-input">
                          <label>
                             Tax:
                          </label>
                          <div className="input-wrappers">
                            <input
                              type="number"
                              value={taxPercent}
                              onChange={(e) => setTaxPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="0"
                            />
                            <span>%</span>
                          </div>
                          <span className="calculated-amount">
                            + ${taxAmount.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="summary-row total">
                          <span>Grand Total:</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <button 
                        className="place-order-btn"
                        onClick={handlePlaceOrder}
                        disabled={cart.length === 0}
                      >
                        <FaCheckCircle /> Place Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;