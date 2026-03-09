import { useState, useEffect } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./addcategory.css";
import { 
  FaFolderPlus, 
  FaTag, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft,
  FaSave
} from "react-icons/fa";

function AddCategory() {
  const navigate = useNavigate();
  
  const [category, setCategory] = useState({
    name: "",
    status: "active"
  });
  
  const [loading, setLoading] = useState(false);
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
      await API.post("/api/categories", category);
      alert("✅ Category added successfully!");
      navigate('/all-categories');
    } catch (error) {
      console.log(error);
      if (error.response?.status === 409) {
        alert("❌ Category name already exists!");
      } else {
        alert("❌ Error adding category. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
                <h1>Add New Category</h1>
                <p>Create a new category to organize your products</p>
              </div>
            </div>
          </div>

          <div className="add-category-container">
            <form onSubmit={handleSubmit} className="add-category-form">
              
              {/* Main Form Card */}
              <div className="form-card">
                <div className="form-card-header">
                  <FaFolderPlus className="header-icon" />
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
                       <span className="doenn-margin"> <FaCheckCircle /></span> Active <br />
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
                     <span className="doenn-margin">   <FaTimesCircle /></span> Inactive <br /> 
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
                      <strong>Use clear names</strong>
                      <p>Choose descriptive names that make sense for your products</p>
                    </div>
                  </li>
                  <li>
                    <span className="tip-number">2</span>
                    <div className="tip-content">
                      <strong>Keep it simple</strong>
                      <p>Avoid special characters and keep names concise</p>
                    </div>
                  </li>
                  <li>
                    <span className="tip-number">3</span>
                    <div className="tip-content">
                      <strong>Active vs Inactive</strong>
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
                      <span className="spinner"></span>
                      Adding Category...
                    </>
                  ) : (
                    <>
                      <FaSave /> Add Category
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

export default AddCategory;