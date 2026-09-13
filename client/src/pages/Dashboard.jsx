import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setUser(data.user);
      })
      .catch(() => {
        setMessage("Could not load dashboard.");
      });
  }, []);

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="home-kicker">
            Your UniBite space
          </span>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""} 👋
          </h1>

          <p>
            Share meals, discover food nearby and keep
            track of your points.
          </p>

          {message && (
            <p className="dashboard-message">
              {message}
            </p>
          )}
        </div>

        <div className="dashboard-points">
          <span>Your Points</span>
          <strong>{user?.credits ?? "-"}</strong>
          <small>
            Use points to reserve meals
          </small>
        </div>
      </section>

      {user && (
        <>
          <section className="dashboard-grid">
            <div className="dashboard-card">
              <span className="dashboard-card-icon">
                👤
              </span>

              <h3>Account</h3>

              <p className="dashboard-card-value">
                {user.name || "User"}
              </p>

              <small>
                Role: {user.role}
              </small>
            </div>

            <div className="dashboard-card">
              <span className="dashboard-card-icon">
                ⭐
              </span>

              <h3>Available Points</h3>

              <p className="dashboard-card-value">
                {user.credits ?? 0}
              </p>

              <small>
                Earn more by sharing meals
              </small>
            </div>

            <div className="dashboard-card">
              <span className="dashboard-card-icon">
                ✅
              </span>

              <h3>Account Status</h3>

              <p className="dashboard-card-value">
                Active
              </p>

              <small>
                Your account is ready to use
              </small>
            </div>
          </section>

          <section className="dashboard-actions-section">
            <h2>Quick Actions</h2>

            <div className="dashboard-actions-grid">
              <Link
                to="/listings"
                className="dashboard-action-card"
              >
                <span>🍽️</span>

                <div>
                  <h3>Browse Meals</h3>
                  <p>
                    Find available meals shared by
                    students nearby.
                  </p>
                </div>
              </Link>

              <Link
                to="/create-listing"
                className="dashboard-action-card"
              >
                <span>🥘</span>

                <div>
                  <h3>Share a Meal</h3>
                  <p>
                    Post an extra portion and earn
                    points from ratings.
                  </p>
                </div>
              </Link>

              <Link
                to="/my-requests"
                className="dashboard-action-card"
              >
                <span>📦</span>

                <div>
                  <h3>My Requests</h3>
                  <p>
                    Track your reservations and rate
                    collected meals.
                  </p>
                </div>
              </Link>

              <Link
                to="/provider-requests"
                className="dashboard-action-card"
              >
                <span>🤝</span>

                <div>
                  <h3>Provider Requests</h3>
                  <p>
                    Manage requests for meals you have
                    shared.
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;