import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        "http://localhost:3000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage(
        "Account created successfully! You start with 5 points."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setLoading(false);
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to the server");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-form-side">
          <span className="home-kicker">
            Join the community
          </span>

          <h1>Create your UniBite account</h1>

          <p className="auth-intro">
            Share meals, discover food nearby and help reduce
            food waste.
          </p>

          <div className="starting-points-box">
            <span>🎁</span>

            <div>
              <strong>Start with 5 points</strong>
              <p>
                Every new UniBite member receives 5 points to
                get started.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="auth-field">
              <label>Name</label>

              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          {message && (
            <p
              className={
                success
                  ? "auth-success-message"
                  : "message"
              }
            >
              {message}
            </p>
          )}

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="auth-image-side">
          <img
            src="/images/hero-food.jpg"
            alt="Fresh food shared on UniBite"
          />

          <div className="auth-image-overlay">
            <span>UniBite</span>

            <h2>
              Good food should be shared, not wasted.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;