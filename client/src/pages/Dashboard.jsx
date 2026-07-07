import { useEffect, useState } from "react";

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
      });
  }, []);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <h1>Welcome back 👋</h1>
        <p>{message}</p>
      </div>

      {user && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>User ID</h3>
            <p>{user.userId}</p>
          </div>

          <div className="dashboard-card">
            <h3>Role</h3>
            <p>{user.role}</p>
          </div>

          <div className="dashboard-card">
            <h3>Account Status</h3>
            <p>Active</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;