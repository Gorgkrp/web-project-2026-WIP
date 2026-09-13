import { useEffect, useState } from "react";

function Listings() {
  const [listings, setListings] = useState([]);
  const [editingListingId, setEditingListingId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    portions: 1,
    pickupLocation: "",
    pickupTime: "",
  });

  const [message, setMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchListings();
  }, []);

  /* =========================================================
     FETCH LISTINGS
  ========================================================= */

  const fetchListings = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/listings"
      );

      const data = await response.json();

      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setListings([]);
      setMessage("Could not load meals.");
    }
  };

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  const canEditListing = (listing) => {
    return (
      currentUser?.id === listing.user?.id ||
      currentUser?.role === "ADMIN"
    );
  };

  const canRequestListing = (listing) => {
    return (
      currentUser &&
      currentUser.id !== listing.user?.id
    );
  };

  /* =========================================================
     EXPIRATION
  ========================================================= */

  const getExpirationText = (expiresAt) => {
    if (!expiresAt) {
      return "No expiration available";
    }

    const now = new Date();
    const expiration = new Date(expiresAt);

    const difference = expiration - now;

    if (difference <= 0) {
      return "Expired";
    }

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes}m remaining`;
  };

  /* =========================================================
     EDIT LISTING
  ========================================================= */

  const startEditing = (listing) => {
    setEditingListingId(listing.id);

    setEditForm({
      title: listing.title,
      description: listing.description,
      portions: listing.portions,
      pickupLocation: listing.pickupLocation,
      pickupTime: listing.pickupTime,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitEdit = async (listingId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/listings/${listingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setEditingListingId(null);
        fetchListings();
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not update listing.");
    }
  };

  /* =========================================================
     REQUEST PORTION
  ========================================================= */

  const requestPortion = async (listingId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "You must be logged in to request a meal."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/listings/${listingId}/request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("Could not request this meal.");
    }
  };

  /* =========================================================
     LISTINGS UI
  ========================================================= */

  return (
    <div className="page listings-page">
      <div className="listings-header">
        <div>
          <span className="home-kicker">
            Available near you
          </span>

          <h1>Find your next meal</h1>

          <p>
            Fresh meals shared by students around your
            university community.
          </p>
        </div>
      </div>

      {message && (
        <p className="message">{message}</p>
      )}

      {listings.length === 0 ? (
        <div className="empty-state">
          <h2>No meals available right now</h2>

          <p>
            Check back later or share a meal of your own.
          </p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="listing-card"
            >
              {editingListingId === listing.id ? (
                <div className="edit-form">
                  <h2>Edit Meal</h2>

                  <label>Meal name</label>

                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                  />

                  <label>Description</label>

                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                  />

                  <label>Portions</label>

                  <input
                    name="portions"
                    type="number"
                    min="1"
                    value={editForm.portions}
                    onChange={handleEditChange}
                  />

                  <label>Pickup location</label>

                  <input
                    name="pickupLocation"
                    value={editForm.pickupLocation}
                    onChange={handleEditChange}
                  />

                  <label>Pickup time</label>

                  <input
                    name="pickupTime"
                    value={editForm.pickupTime}
                    onChange={handleEditChange}
                  />

                  <div className="button-row">
                    <button
                      onClick={() =>
                        submitEdit(listing.id)
                      }
                    >
                      Save Changes
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        setEditingListingId(null)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="listing-image-wrapper">
                    <img
                      src={
                        listing.imageUrl
                          ? `http://localhost:3000${listing.imageUrl}`
                          : "/images/default-meal.jpg"
                      }
                      alt={listing.title}
                      className="listing-image"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/default-meal.jpg";
                      }}
                    />

                    <span className="listing-portions-badge">
                      {listing.portions}{" "}
                      {listing.portions === 1
                        ? "portion"
                        : "portions"}
                    </span>
                  </div>

                  <div className="listing-content">
                    <h2>{listing.title}</h2>

                    <p className="listing-description">
                      {listing.description}
                    </p>

                    {listing.allergens && (
                      <div className="listing-allergens">
                        <span>⚠️ Allergens</span>

                        <p>{listing.allergens}</p>
                      </div>
                    )}

                    <div className="listing-meta">
                      <div>
                        <span>📍</span>

                        <div>
                          <small>Pickup</small>

                          <strong>
                            {listing.pickupLocation}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span>🕒</span>

                        <div>
                          <small>Time</small>

                          <strong>
                            {listing.pickupTime}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="listing-footer-info">
                      <span>
                        By{" "}
                        <strong>
                          {listing.user?.name ||
                            "Unknown user"}
                        </strong>
                      </span>

                      <span className="expiration-badge">
                        ⏳{" "}
                        {getExpirationText(
                          listing.expiresAt
                        )}
                      </span>
                    </div>

                    <div className="button-row">
                      {canEditListing(listing) && (
                        <button
                          onClick={() =>
                            startEditing(listing)
                          }
                        >
                          Edit Listing
                        </button>
                      )}

                      {canRequestListing(listing) && (
                        <button
                          onClick={() =>
                            requestPortion(listing.id)
                          }
                        >
                          Request Portion
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Listings;