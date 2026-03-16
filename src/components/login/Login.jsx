import { useState } from "react";
import { API } from "../../api/api";
import { useNavigate , Link} from "react-router-dom";
import "./login.css";
import logo from "../../assets/logo.png";

function Login(){

const navigate = useNavigate();

const [form,setForm] = useState({
  email:"",
  password:""
});

const [error,setError] = useState("");


const [showPassword, setShowPassword] = useState(false);

const handleChange = (e)=>{
  setForm({...form,[e.target.name]:e.target.value})
}


const handleSubmit = async(e)=>{
  e.preventDefault();

  try{

    const res = await API.post("/api/auth",form);

    localStorage.setItem("token",res.data.token);

    navigate("/dashboard");

  }catch(err){

    if(err.response && err.response.data.message){
      setError(err.response.data.message);
    }else{
      setError("Something went wrong");
    }

  }

}

return(

<div className="login-container">

<div className="login-card">

<div className="login-header">
  <img height={80} src={logo} alt="" />
<h2>Admin Login</h2>
<p>Welcome back! Please login to your account</p>
</div>

<form onSubmit={handleSubmit} className="login-form">

<div className="form-group">
<div className="input-wrapper">
<svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
<polyline points="22,6 12,13 2,6" />
</svg>
<input
type="email"
name="email"
placeholder="Enter your email"
value={form.email}
onChange={handleChange}
required
/>
</div>
</div>

<div className="form-group">
<div className="input-wrapper">
<svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
<path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>
<input
type={showPassword ? "text" : "password"}
name="password"
placeholder="Enter your password"
value={form.password}
onChange={handleChange}
required
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
</div>

{error && <p className="error-message">{error}</p>}

<button type="submit" className="submit-button">
Login
</button>

</form>

<div className="login-footer">
<span>Don't have an account?</span>
<Link className="register-link" to='/register'>Sign up</Link>

</div>

</div>
</div>

)

}

export default Login;