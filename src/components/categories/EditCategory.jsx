import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import "./editcategory.css";
import { 
  FaTag, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft,
  FaSave,
  FaFolderOpen,
  FaSpinner
} from "react-icons/fa";

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState({
    name: "",
    status: "active"
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
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

  // Fetch category details
  const fetchCategory = async () => {
    try {
      setFetchLoading(true);
      const res = await API.get(`/api/categories/${id}`);
      setCategory(res.data);
    } catch (error) {
      console.log(error);
      alert("❌ Error fetching category");
      navigate("/all-categories");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!category.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (category.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (category.name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      await API.put(`/api/categories/${id}`, category);
      alert("✅ Category updated successfully!");
      navigate("/all-categories");
    } catch (error) {
      console.log(error);
      if (error.response?.status === 409) {
        alert("❌ Category name already exists!");
      } else {
        alert("❌ Update failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
          <Navbar />
          <div className="dashboard-content">
            <div className="loading-state">
              <FaSpinner className="spinner-icon" />
              <p>Loading category details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        
        <div className="dashboard-content">
          <div className="page-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate("/all-categories")}>
                <FaArrowLeft /> Back
              </button>
              <div>
                <h1>Edit Category</h1>
                <p>Update category information</p>
              </div>
            </div>
          </div>

          <div className="edit-category-container">
            <form onSubmit={handleSubmit} className="edit-category-form">
              
              {/* Main Form Card */}
              <div className="form-card">
                <div className="form-card-header">
                  <FaFolderOpen className="header-icon" />
                  <h3>Category Information</h3>
                </div>
                
                <div className="form-card-body">
                  {/* Category Name Field */}
                  <div className="form-group">
                    <label>
                      <FaTag className="input-icon" />
                      Category Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={category.name}
                      onChange={handleChange}
                      placeholder="Enter category name (e.g., Electronics, Clothing)"
                      className={errors.name ? 'error' : ''}
                      autoFocus
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                    <small className="field-hint">
                      {category.name.length}/50 characters
                    </small>
                  </div>

                  {/* Status Field */}
                  <div className="form-group">
                    <label>Status</label>
                    <div className="status-toggle">
                      <label className={`status-option ${category.status === 'active' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={category.status === 'active'}
                          onChange={handleChange}
                        />
                        <FaCheckCircle /> Active
                        <span className="status-desc">Category is visible and usable</span>
                      </label>
                      <label className={`status-option ${category.status === 'inactive' ? 'inactive' : ''}`}>
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={category.status === 'inactive'}
                          onChange={handleChange}
                        />
                        <FaTimesCircle /> Inactive
                        <span className="status-desc">Category is hidden</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="preview-section">
                    <h4>Preview</h4>
                    <div className="preview-card">
                      <div className="preview-icon">
                        <FaTag />
                      </div>
                      <div className="preview-details">
                        <span className="preview-name">
                          {category.name || "Category Name"}
                        </span>
                        <span className={`preview-status ${category.status}`}>
                          {category.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {category.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips Card */}
              {/* <div className="tips-card">
                <h3>Quick Tips</h3>
                <ul className="tips-list">
                  <li>
                    <span className="tip-number">1</span>
                    <div className="tip-content">
                      <strong>Keep it consistent</strong>
                      <p>Use the same naming convention as your other categories</p>
                    </div>
                  </li>
                  <li>
                    <span className="tip-number">2</span>
                    <div className="tip-content">
                      <strong>Check spelling</strong>
                      <p>Review the category name before saving changes</p>
                    </div>
                  </li>
                  <li>
                    <span className="tip-number">3</span>
                    <div className="tip-content">
                      <strong>Status matters</strong>
                      <p>Inactive categories won't appear in product forms</p>
                    </div>
                  </li>
                  <li>
                    <span className="tip-number">4</span>
                    <div className="tip-content">
                      <strong>Unique names</strong>
                      <p>Category names must be unique in your store</p>
                    </div>
                  </li>
                </ul>
              </div> */}

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate('/all-categories')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Updating Category...
                    </>
                  ) : (
                    <>
                      <FaSave /> Update Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;