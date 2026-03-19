import { useEffect, useState } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./allproduct.css";
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaPlus,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaImage,
  FaBox,
  FaTag,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaPrint
} from "react-icons/fa";

function AllProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [imageErrors, setImageErrors] = useState({});
  
  // Add sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      }
    };

    // Initial check
    handleSidebarChange();

    // Create a mutation observer to watch for class changes on sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/products");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search and Filter Logic
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.price?.toString().includes(searchTerm) ||
        product.quantity?.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested category object
        if (sortConfig.key === 'category') {
          aValue = a.category?.name || '';
          bValue = b.category?.name || '';
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(result);
  }, [searchTerm, products, statusFilter, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="sort-icon active" /> : 
      <FaSortDown className="sort-icon active" />;
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/api/products/${id}`);
      fetchProducts();
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <span className="status-badge active"><FaCheckCircle /> Active</span> : 
      <span className="status-badge inactive"><FaTimesCircle /> Inactive</span>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Description', 'Price', 'Quantity', 'Status'];
    const csvData = filteredProducts.map(p => [
      p.name,
      p.category?.name || 'N/A',
      p.description || 'N/A',
      p.price,
      p.quantity,
      p.status
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      {/* Add the sidebarCollapsed class to dashboard-main */}
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>All Products</h1>
              <p>Manage your inventory and product listings</p>
            </div>
            <button 
              className="add-product-btn"
              onClick={() => navigate('/add-product')}
            >
              <FaPlus /> Add New Product
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products by name, category, price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="filter-wrapper">
              <FaFilter className="filter-icon" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* <div className="action-buttons">
              <button className="action-btn export" onClick={exportToCSV}>
                <FaDownload /> Export
              </button>
              <button className="action-btn print" onClick={() => window.print()}>
                <FaPrint /> Print
              </button>
            </div> */}
          </div>

          {/* Stats Cards */}
          <div className="stats-mini">
            <div className="stat-mini-card">
              <FaBox className="stat-mini-icon" />
              <div>
                <span className="stat-mini-label">Total Products</span>
                <span className="stat-mini-value">{products.length}</span>
              </div>
            </div>
            <div className="stat-mini-card">
              <FaCheckCircle className="stat-mini-icon active" />
              <div>
                <span className="stat-mini-label">Active</span>
                <span className="stat-mini-value">
                  {products.filter(p => p.status === 'active').length}
                </span>
              </div>
            </div>
            <div className="stat-mini-card">
              <FaTimesCircle className="stat-mini-icon inactive" />
              <div>
                <span className="stat-mini-label">Inactive</span>
                <span className="stat-mini-value">
                  {products.filter(p => p.status === 'inactive').length}
                </span>
              </div>
            </div>
            <div className="stat-mini-card">
              <FaDollarSign className="stat-mini-icon" />
              <div>
                <span className="stat-mini-label">Total Value</span>
                <span className="stat-mini-value">
                  {formatPrice(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
          </div>

          {/* Products Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <FaBox className="empty-icon" />
                <h3>No products found</h3>
                <p>{searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}</p>
                {!searchTerm && (
                  <button 
                    className="add-product-btn"
                    onClick={() => navigate('/add-product')}
                  >
                    <FaPlus /> Add Product
                  </button>
                )}
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th onClick={() => handleSort('name')}>
                      Product Name {getSortIcon('name')}
                    </th>
                    <th onClick={() => handleSort('category')}>
                      Category {getSortIcon('category')}
                    </th>
                    <th>Description</th>
                    <th onClick={() => handleSort('price')}>
                      Price {getSortIcon('price')}
                    </th>
                    <th onClick={() => handleSort('quantity')}>
                      Stock {getSortIcon('quantity')}
                    </th>
                    <th onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id}>
                      <td className="image-cell">
                        {!imageErrors[p._id] && p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="product-thumbnail"
                            onError={() => handleImageError(p._id)}
                          />
                        ) : (
                          <div className="no-image">
                            <FaImage />
                          </div>
                        )}
                      </td>
                      <td className="allproduct-name">{p.name}</td>
                      <td>
                        <span className="category-badge">
                          <FaTag /> {p.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="description-cell">
                        {p.description ? (
                          <span className="description-text" title={p.description}>
                            {p.description.length > 50 
                              ? `${p.description.substring(0, 50)}...` 
                              : p.description}
                          </span>
                        ) : (
                          <span className="no-description">No description</span>
                        )}
                      </td>
                      <td className="price-cell">{formatPrice(p.price)}</td>
                      <td className={`quantity-cell ${p.quantity <= 5 ? 'low-stock' : ''}`}>
                        {p.quantity} {p.quantity <= 5 && <span className="stock-warning">Low</span>}
                      </td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/edit-product/${p._id}`)}
                          title="Edit Product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteModal({ 
                            show: true, 
                            id: p._id, 
                            name: p.name 
                          })}
                          title="Delete Product"
                        >
                          <FaTrash />
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Product</h3>
              <button 
                className="modal-close"
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>"{deleteModal.name}"</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete"
                onClick={() => deleteProduct(deleteModal.id)}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllProducts;