import { useState } from "react";
import { API } from "../../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";
import logo from "../../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";
      
      case 'email':
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email";
        return "";
      
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        return "";
      
      case 'confirmPassword':
        if (value !== form.password) return "Passwords do not match";
        return "";
      
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const validationErrors = validateForm();
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });

     
        navigate("/", { state: { message: "Registration successful! Please log in." } });
     
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
            <img height={80} src={logo} alt="" />
          <h2>Create an account</h2>
          <p>Join us to start managing your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.name && touched.name ? 'error' : ''}
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
            {errors.name && touched.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email ? 'error' : ''}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && touched.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password && touched.password ? 'error' : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {form.password && !errors.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${
                      form.password.length < 8 ? 'weak' :
                      form.password.length < 12 ? 'medium' : 'strong'
                    }`} 
                    style={{ width: `${Math.min(100, (form.password.length / 20) * 100)}%` }}
                  />
                </div>
                <span className="strength-text">
                  {form.password.length < 8 ? 'Weak' :
                   form.password.length < 12 ? 'Medium' : 'Strong'} password
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.submit && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          <div className="register-footer">
            <span>Already have an account?</span>
            <Link to="/" className="login-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;