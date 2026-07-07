import { useEffect, useState } from "react";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/listings/requests/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    setRequests(data);
  };

  const handleRatingChange = (requestId, value) => {
    setRatings({
      ...ratings,
      [requestId]: value,
    });
  };

  const submitRating = async (requestId) => {
    const token = localStorage.getItem("token");
    const rating = ratings[requestId];

    const response = await fetch(
      `http://localhost:3000/listings/requests/${requestId}/rate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      }
    );

    const data = await response.json();

    setMessage(data.message);

    if (response.ok) {
      fetchRequests();
    }
  };

  return (
    <div className="page requests-container">
      <h1>My Requests</h1>

      {message && <p className="message">{message}</p>}

      {requests.length === 0 ? (
        <p>You have not requested any meals yet.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="request-card">
            <h3 className="request-title">🍽 {request.listing.title}</h3>

            <p className="request-info">Provider: {request.provider.name}</p>

            <div
              className={`status-badge status-${request.status
                .toLowerCase()
                .replace("_", "-")}`}
            >
              {request.status}
            </div>

            {request.rating && (
              <p className="request-info">
                Your rating: {"⭐".repeat(request.rating)} ({request.rating}/5)
              </p>
            )}

            {request.status === "PICKED_UP" && !request.rating && (
              <div className="rating-box">
                <p className="request-info">Rate this meal:</p>

                <select
                  value={ratings[request.id] || ""}
                  onChange={(e) =>
                    handleRatingChange(request.id, Number(e.target.value))
                  }
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>

                <button onClick={() => submitRating(request.id)}>
                  Submit Rating
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyRequests;
