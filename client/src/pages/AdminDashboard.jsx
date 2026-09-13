import { useEffect, useState } from "react";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);

  const [topDonor, setTopDonor] = useState(null);
  const [topRatedMeals, setTopRatedMeals] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  /* =========================================================
     FETCH ADMIN DATA
  ========================================================= */

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [
        statsResponse,
        usersResponse,
        listingsResponse,
        leaderboardResponse,
      ] = await Promise.all([
        fetch(
          "http://localhost:3000/admin/stats",
          { headers }
        ),

        fetch(
          "http://localhost:3000/admin/users",
          { headers }
        ),

        fetch(
          "http://localhost:3000/admin/listings",
          { headers }
        ),

        fetch(
          "http://localhost:3000/admin/leaderboard",
          { headers }
        ),
      ]);

      const statsData =
        await statsResponse.json();

      const usersData =
        await usersResponse.json();

      const listingsData =
        await listingsResponse.json();

      const leaderboardData =
        await leaderboardResponse.json();

      if (statsResponse.ok) {
        setStats(statsData);
      }

      if (usersResponse.ok) {
        setUsers(
          Array.isArray(usersData)
            ? usersData
            : []
        );
      }

      if (listingsResponse.ok) {
        setListings(
          Array.isArray(listingsData)
            ? listingsData
            : []
        );
      }

      if (leaderboardResponse.ok) {
        setTopDonor(
          leaderboardData.topDonor || null
        );

        setTopRatedMeals(
          leaderboardData.topRatedMeals || []
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to load admin data"
      );
    }
  };

  /* =========================================================
     DELETE LISTING
  ========================================================= */

  const handleDeleteListing = async (
    listingId
  ) => {
    const token =
      localStorage.getItem("token");

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
      setListings(
        listings.filter(
          (listing) =>
            listing.id !== listingId
        )
      );

      fetchAdminData();
    }

    setMessage(data.message);
  };

  /* =========================================================
     BAN USER
  ========================================================= */

  const handleBanUser = async (userId) => {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}/ban`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                isBanned: true,
              }
            : user
        )
      );
    }

    setMessage(data.message);
  };

  /* =========================================================
     UNBAN USER
  ========================================================= */

  const handleUnbanUser = async (
    userId
  ) => {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}/unban`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                isBanned: false,
              }
            : user
        )
      );
    }

    setMessage(data.message);
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <span className="home-kicker">
          Administration
        </span>

        <h1>Admin Dashboard</h1>

        <p>
          Platform statistics, community
          activity and moderation.
        </p>
      </div>

      {message && (
        <p className="message">
          {message}
        </p>
      )}

      {/* STATISTICS */}

      {stats && (
        <section className="admin-section">
          <h2>Platform Statistics</h2>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>👥</span>
              <strong>
                {stats.usersCount}
              </strong>
              <p>Total Users</p>
            </div>

            <div className="admin-stat-card">
              <span>🍽️</span>
              <strong>
                {stats.listingsCount}
              </strong>
              <p>Total Listings</p>
            </div>

            <div className="admin-stat-card">
              <span>🟢</span>
              <strong>
                {stats.activeListingsCount}
              </strong>
              <p>Active Listings</p>
            </div>

            <div className="admin-stat-card featured">
              <span>🤝</span>

              <strong>
                {stats.mealsSharedLastMonth}
              </strong>

              <p>
                Meals Shared Last Month
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TOP DONOR */}

      <section className="admin-section">
        <h2>Community Leaderboard</h2>

        {topDonor ? (
          <div className="top-donor-card">
            <div className="top-donor-icon">
              🏆
            </div>

            <div>
              <span className="admin-label">
                Top Donor
              </span>

              <h2>
                {topDonor.provider.name}
              </h2>

              <p>
                Successfully shared{" "}
                <strong>
                  {topDonor.mealsShared}
                </strong>{" "}
                meals during the last month.
              </p>

              {topDonor.averageRating && (
                <p>
                  ⭐ Average rating:{" "}
                  <strong>
                    {topDonor.averageRating}
                    /5
                  </strong>{" "}
                  ({topDonor.ratingsCount}{" "}
                  ratings)
                </p>
              )}

              <p>
                Points:{" "}
                <strong>
                  {topDonor.provider.credits}
                </strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>
              No successful meal deliveries
              during the last month.
            </p>
          </div>
        )}
      </section>

      {/* TOP RATED MEALS */}

      <section className="admin-section">
        <h2>Highest Rated Meals</h2>

        {topRatedMeals.length === 0 ? (
          <div className="empty-state">
            <p>
              No rated meals available yet.
            </p>
          </div>
        ) : (
          <div className="top-meals-grid">
            {topRatedMeals.map(
              (meal, index) => (
                <div
                  key={meal.listing.id}
                  className="top-meal-card"
                >
                  <span className="ranking-number">
                    #{index + 1}
                  </span>

                  {meal.listing.imageUrl && (
                    <img
                      src={`http://localhost:3000${meal.listing.imageUrl}`}
                      alt={
                        meal.listing.title
                      }
                    />
                  )}

                  <h3>
                    {meal.listing.title}
                  </h3>

                  <p>
                    By{" "}
                    <strong>
                      {meal.provider.name}
                    </strong>
                  </p>

                  <div className="meal-rating">
                    ⭐{" "}
                    {meal.averageRating}/5
                  </div>

                  <small>
                    {meal.ratingsCount}{" "}
                    {meal.ratingsCount === 1
                      ? "rating"
                      : "ratings"}
                  </small>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* USERS */}

      <section className="admin-section">
        <h2>Users</h2>

        <div className="admin-list">
          {users.map((user) => (
            <div
              key={user.id}
              className="admin-management-card"
            >
              <div>
                <h3>{user.name}</h3>

                <p>
                  {user.email}
                </p>

                <p>
                  Role:{" "}
                  <strong>
                    {user.role}
                  </strong>
                </p>

                <p>
                  Points:{" "}
                  <strong>
                    {user.credits}
                  </strong>
                </p>

                <span
                  className={
                    user.isBanned
                      ? "admin-status banned"
                      : "admin-status active"
                  }
                >
                  {user.isBanned
                    ? "Banned"
                    : "Active"}
                </span>
              </div>

              {user.role !== "ADMIN" && (
                <div className="button-row">
                  {!user.isBanned ? (
                    <button
                      onClick={() =>
                        handleBanUser(
                          user.id
                        )
                      }
                    >
                      Ban User
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleUnbanUser(
                          user.id
                        )
                      }
                    >
                      Unban User
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LISTINGS */}

      <section className="admin-section">
        <h2>Listings</h2>

        <div className="admin-list">
          {listings.map(
            (listing) => (
              <div
                key={listing.id}
                className="admin-management-card"
              >
                <div>
                  <h3>
                    {listing.title}
                  </h3>

                  <p>
                    {listing.description}
                  </p>

                  <p>
                    Status:{" "}
                    <strong>
                      {listing.status}
                    </strong>
                  </p>

                  <p>
                    Portions:{" "}
                    {listing.portions}
                  </p>

                  <p>
                    Provider:{" "}
                    <strong>
                      {
                        listing.user
                          ?.name
                      }
                    </strong>
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDeleteListing(
                      listing.id
                    )
                  }
                >
                  Delete Listing
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;