import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../../api/api";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import "./EditProduct.css";
import { 
  FaCloudUploadAlt, 
  FaTag, 
  FaBox, 
  FaDollarSign, 
  FaList, 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSave,
  FaArrowLeft,
  FaImage
} from "react-icons/fa";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    status: "active"
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [categories, setCategories] = useState([]);
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

  // Fetch categories
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

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true);
        const res = await API.get(`/api/products/${id}`);
        setProduct({
          name: res.data.name || "",
          category: res.data.category?._id || res.data.category || "",
          description: res.data.description || "",
          price: res.data.price || "",
          quantity: res.data.quantity || "",
          status: res.data.status || "active"
        });
        if (res.data.image) {
          setExistingImage(res.data.image);
        }
      } catch (error) {
        console.log("Error fetching product", error);
        alert("Error loading product");
        navigate("/all-products");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

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

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
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
      
      Object.keys(product).forEach((key) => {
        formData.append(key, product[key]);
      });
      
      if (image) {
        formData.append("image", image);
      }

      await API.put(`/api/products/${id}`, formData);
      alert("✅ Product updated successfully!");
      navigate("/all-products");
    } catch (err) {
      console.log(err);
      alert("❌ Update failed. Please try again.");
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
              <div className="spinner"></div>
              <p>Loading product details...</p>
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
              <button className="back-btn" onClick={() => navigate("/all-products")}>
                <FaArrowLeft /> Back
              </button>
              <div>
                <h1>Edit Product</h1>
                <p>Update product information</p>
              </div>
            </div>
          </div>

          <div className="edit-product-container">
            <form onSubmit={handleSubmit} className="edit-product-form">
              
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
                      {categories.map((c) => (
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
                       <span className="doen-margin"> <FaCheckCircle /></span> Active
                      </label>
                      <label className={`status-option ${product.status === 'inactive' ? 'inactive' : ''}`}>
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={product.status === 'inactive'}
                          onChange={handleChange}
                        />
                        <span className="doen-margin"><FaTimesCircle /></span> Inactive
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
                          onClick={removeImage}
                        >
                          ×
                        </button>
                      </div>
                    ) : existingImage && !image ? (
                      <div className="image-preview">
                        <img 
                          src={`${BASE_URL}/uploads/${existingImage}`} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.parentElement.innerHTML = '<div class="no-image"><FaImage /></div>';
                          }}
                        />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => setExistingImage(null)}
                        >
                          ×
                        </button>
                        <span className="image-badge">Current</span>
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
                          <span>Click to upload new image</span>
                          <small>PNG, JPG, GIF up to 5MB</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Quick Tips</h3>
                  <ul className="tips-list">
                    <li> Update product details as needed</li>
                    <li> Upload a new image to replace existing one</li>
                    <li> Keep prices competitive</li>
                    <li> Monitor stock levels regularly</li>
                    <li> Toggle status to show/hide product</li>
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
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <FaSave /> Update Product
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

export default EditProduct;