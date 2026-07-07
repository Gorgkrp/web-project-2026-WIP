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

  const fetchListings = async () => {
    const response = await fetch("http://localhost:3000/listings");
    const data = await response.json();
    setListings(data);
  };

  const canEditListing = (listing) => {
    return currentUser?.id === listing.user?.id || currentUser?.role === "ADMIN";
  };

  const canRequestListing = (listing) => {
    return currentUser && currentUser.id !== listing.user?.id;
  };

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

    const response = await fetch(`http://localhost:3000/listings/${listingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });

    const data = await response.json();

    if (response.ok) {
      setListings(
        listings.map((listing) =>
          listing.id === listingId ? data.listing : listing
        )
      );

      setEditingListingId(null);
    }

    setMessage(data.message);
  };

  const requestPortion = async (listingId) => {
    const token = localStorage.getItem("token");

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
  };

  return (
    <div className="page">
      <h1>Food Listings</h1>

      {message && <p className="message">{message}</p>}

      {listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              {editingListingId === listing.id ? (
                <div className="edit-form">
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                  />

                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                  />

                  <input
                    name="portions"
                    type="number"
                    value={editForm.portions}
                    onChange={handleEditChange}
                  />

                  <input
                    name="pickupLocation"
                    value={editForm.pickupLocation}
                    onChange={handleEditChange}
                  />

                  <input
                    name="pickupTime"
                    value={editForm.pickupTime}
                    onChange={handleEditChange}
                  />

                  <div className="button-row">
                    <button onClick={() => submitEdit(listing.id)}>
                      Save Changes
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setEditingListingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2>{listing.title}</h2>

                  <p>{listing.description}</p>

                  <p>
                    <strong>Portions:</strong> {listing.portions}
                  </p>

                  <p>
                    <strong>Pickup:</strong> {listing.pickupLocation}
                  </p>

                  <p>
                    <strong>Time:</strong> {listing.pickupTime}
                  </p>

                  <p>
                    <strong>Posted by:</strong>{" "}
                    {listing.user?.name || "Unknown user"}
                  </p>

                  <div className="button-row">
                    {canEditListing(listing) && (
                      <button onClick={() => startEditing(listing)}>
                        Edit Listing
                      </button>
                    )}

                    {canRequestListing(listing) && (
                      <button onClick={() => requestPortion(listing.id)}>
                        Request Portion
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Listings;