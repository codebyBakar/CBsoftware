import { useEffect, useState } from "react";
import { API } from "../../api/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import "./allcategory.css";
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaPlus,
  FaFilter,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaFolderOpen,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";

function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/categories");
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search and Filter Logic
  useEffect(() => {
    let result = [...categories];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(category => category.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

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

    setFilteredCategories(result);
  }, [searchTerm, categories, statusFilter, sortConfig]);

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

  const deleteCategory = async (id) => {
    try {
      await API.delete(`/api/categories/${id}`);
      fetchCategories();
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("❌ Error deleting category. It may have products linked to it.");
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <span className="status-badge active"><FaCheckCircle /> Active</span> : 
      <span className="status-badge inactive"><FaTimesCircle /> Inactive</span>;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>All Categories</h1>
              <p>Manage your product categories</p>
            </div>
            <button 
              className="add-category-btn"
              onClick={() => navigate('/add-category')}
            >
              <FaPlus /> Add New Category
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search categories by name..."
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
          </div>

          {/* Stats Cards */}
          <div className="stats-mini">
            <div className="stat-mini-card">
              <FaFolderOpen className="stat-mini-icon" />
              <div>
                <span className="stat-mini-label">Total Categories</span>
                <span className="stat-mini-value">{categories.length}</span>
              </div>
            </div>
            <div className="stat-mini-card">
              <FaCheckCircle className="stat-mini-icon active" />
              <div>
                <span className="stat-mini-label">Active</span>
                <span className="stat-mini-value">
                  {categories.filter(c => c.status === 'active').length}
                </span>
              </div>
            </div>
            <div className="stat-mini-card">
              <FaTimesCircle className="stat-mini-icon inactive" />
              <div>
                <span className="stat-mini-label">Inactive</span>
                <span className="stat-mini-value">
                  {categories.filter(c => c.status === 'inactive').length}
                </span>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <span>Showing {filteredCategories.length} of {categories.length} categories</span>
          </div>

          {/* Categories Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                <FaFolderOpen className="empty-icon" />
                <h3>No categories found</h3>
                <p>{searchTerm ? 'Try adjusting your search' : 'Add your first category to get started'}</p>
                {!searchTerm && (
                  <button 
                    className="add-category-btn"
                    onClick={() => navigate('/add-category')}
                  >
                    <FaPlus /> Add Category
                  </button>
                )}
              </div>
            ) : (
              <table className="categories-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>
                      <FaTag className="th-icon" /> Category Name {getSortIcon('name')}
                    </th>
                    <th onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td className="category-name">
                        <div className="category-info">
                          <div className="category-icon">
                            <FaTag />
                          </div>
                          <span className="category-title">{category.name}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(category.status)}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/edit-category/${category._id}`)}
                          title="Edit Category"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteModal({ 
                            show: true, 
                            id: category._id, 
                            name: category.name 
                          })}
                          title="Delete Category"
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
              <h3>Delete Category</h3>
              <button 
                className="modal-close"
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>"{deleteModal.name}"</strong>?</p>
              <p className="warning-text">This action cannot be undone. Categories with products cannot be deleted.</p>
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
                onClick={() => deleteCategory(deleteModal.id)}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllCategories;