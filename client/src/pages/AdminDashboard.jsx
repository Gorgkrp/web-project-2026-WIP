import { useEffect, useState } from "react";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStats(data));

    fetch("http://localhost:3000/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch("http://localhost:3000/admin/listings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch(() => setMessage("Failed to load admin data"));
  }, []);

 const handleDeleteListing = async (listingId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:3000/admin/listings/${listingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (response.ok) {
    setListings(listings.filter((listing) => listing.id !== listingId));
  }

  setMessage(data.message);
};
 
const handleBanUser = async (userId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/admin/users/${userId}/ban`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isBanned: true } : user
      )
    );
  }

  setMessage(data.message);
};
const handleUnbanUser = async (userId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/admin/users/${userId}/unban`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isBanned: false } : user
      )
    );
  }

  setMessage(data.message);
};

return (
    <div style={{ padding: "24px" }}>
      <h1>Admin Dashboard</h1>

      {message && <p>{message}</p>}

      {stats && (
        <div style={{ marginBottom: "32px" }}>
          <h2>Statistics</h2>
          <p>Total users: {stats.usersCount}</p>
          <p>Total listings: {stats.listingsCount}</p>
          <p>Active listings: {stats.activeListingsCount}</p>
        </div>
      )}

      <div style={{ marginBottom: "32px" }}>
        <h2>Users</h2>

        {users.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid gray",
              padding: "12px",
              marginBottom: "8px",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>{user.name}</strong>
            </p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Credits: {user.credits}</p>
<p>Status: {user.isBanned ? "Banned" : "Active"}</p>

<button
  onClick={() => handleBanUser(user.id)}
  disabled={user.isBanned || user.role === "ADMIN"}
>
  Ban User
</button>
<button
  onClick={() => handleUnbanUser(user.id)}
  disabled={!user.isBanned || user.role === "ADMIN"}
>
  Unban User
</button>


 </div>
        ))}
      </div>

      <div>
        <h2>Listings</h2>

        {listings.map((listing) => (
          <div
            key={listing.id}
            style={{
              border: "1px solid gray",
              padding: "12px",
              marginBottom: "8px",
              borderRadius: "8px",
            }}
          >
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>Status: {listing.status}</p>
            <p>Portions: {listing.portions}</p>
            <p>Provider: {listing.user.name}</p>
            
            <button onClick={() => handleDeleteListing(listing.id)}>
              Delete Listing
            </button>
          
          </div>
         ))}
      </div>
    </div>
  );
}

export default AdminDashboard;