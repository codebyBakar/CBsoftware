import { useEffect, useState } from "react";
import { API } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import { FaCloudUploadAlt, FaTag, FaBox, FaDollarSign, FaList, FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    status: "active"
  });

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

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.log("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.category) newErrors.category = "Please select a category";
    if (!product.price) newErrors.price = "Price is required";
    else if (product.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!product.quantity) newErrors.quantity = "Quantity is required";
    else if (product.quantity < 0) newErrors.quantity = "Quantity cannot be negative";
    
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
      const formData = new FormData();

      Object.keys(product).forEach(key => {
        formData.append(key, product[key]);
      });

      if (image) {
        formData.append("image", image);
      }

      await API.post("/api/products", formData);

      // Show success message
      alert("✅ Product added successfully!");
      navigate('/all-products');
    } catch (error) {
      console.log(error);
      alert("❌ Error adding product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      {/* Add the sidebarCollapsed class to dashboard-main */}
      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar />
        <div className="dashboard-content">
          <div className="page-header">
            <h1>Add New Product</h1>
            <p>Fill in the details below to add a new product to your inventory</p>
          </div>

          <div className="add-product-container">
            <form onSubmit={handleSubmit} className="add-product-form">
              
              {/* Left Column - Main Details */}
              <div className="form-left">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>
                      <FaTag className="input-icon" />
                      Product Name <span className="required">*</span>
                    </label>
                    <input
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaList className="input-icon" />
                      Category <span className="required">*</span>
                    </label>
                    <select
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      required
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Select a category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaFileAlt className="input-icon" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Pricing & Stock</h3>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label>
                        <FaDollarSign className="input-icon" />
                        Price ($) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className={errors.price ? 'error' : ''}
                      />
                      {errors.price && <span className="error-message">{errors.price}</span>}
                    </div>

                    <div className="form-group half">
                      <label>
                        <FaBox className="input-icon" />
                        Quantity <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        required
                        className={errors.quantity ? 'error' : ''}
                      />
                      {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <div className="status-toggle">
                      <label className={`status-option ${product.status === 'active' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={product.status === 'active'}
                          onChange={handleChange}
                        />
                      <span className="doen-margin">  <FaCheckCircle /></span> Active
                      </label>
                      <label className={`status-option ${product.status === 'inactive' ? 'inactive' : ''}`}>
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={product.status === 'inactive'}
                          onChange={handleChange}
                        />
                       <span className="doen-margin"> <FaTimesCircle /></span> Inactive
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="form-right">
                <div className="form-section image-section">
                  <h3>Product Image</h3>
                  
                  <div className="image-upload-container">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <input
                          type="file"
                          id="image-upload"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="file-input"
                        />
                        <label htmlFor="image-upload" className="upload-label">
                          <FaCloudUploadAlt className="upload-icon" />
                          <span>Click to upload image</span>
                          <small>PNG, JPG, GIF up to 5MB</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Quick Tips</h3>
                  <ul className="tips-list">
                    <li> Use clear, descriptive product names</li>
                    <li> Add detailed descriptions for better visibility</li>
                    <li> High-quality images increase sales</li>
                    <li> Set competitive prices</li>
                    <li> Keep track of stock levels</li>
                  </ul>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate('/all-products')}
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
                      Adding Product...
                    </>
                  ) : (
                    'Add Product'
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

export default AddProduct;