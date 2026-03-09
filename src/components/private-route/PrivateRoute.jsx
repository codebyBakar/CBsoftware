import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function PrivateRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Short delay to prevent flash of content
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Check both localStorage and sessionStorage for token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Show loading spinner while checking
  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-50)'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--gray-200)',
          borderTopColor: 'var(--primary-600)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // If no token, redirect to login with return URL
  if (!token) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // If token exists, render the protected component
  return children;
}

export default PrivateRoute;