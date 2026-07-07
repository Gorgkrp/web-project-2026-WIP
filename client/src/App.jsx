import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateListing from "./pages/CreateListing.jsx";
import Listings from "./pages/Listings.jsx";
import ProviderRequests from "./pages/ProviderRequests";
import MyRequests from "./pages/MyRequests";

function App() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          🍽️ UniBite
        </Link>

        <div className="navbar-links">
          {currentUser?.role === "ADMIN" && (
            <Link to="/admin">Admin</Link>
          )}

          {!currentUser && (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}

          {currentUser && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/listings">Meals</Link>
              <Link to="/create-listing">Create Meal</Link>
              <Link to="/provider-requests">Provider Requests</Link>
              <Link to="/my-requests">My Requests</Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {currentUser ? (
            <>
              <span>{currentUser.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <span>Guest</span>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/provider-requests" element={<ProviderRequests />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="*" element={<h1 className="page">Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;