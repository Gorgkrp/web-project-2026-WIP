import { useEffect, useState } from "react";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState("");
  const [penaltiesApplied, setPenaltiesApplied] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/listings/requests/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load requests");
        setRequests([]);
        return;
      }

      setRequests(data.requests || []);
      setPenaltiesApplied(data.penaltiesApplied || 0);
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to the server.");
      setRequests([]);
    }
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

    if (!rating) {
      setMessage("Please select a rating first.");
      return;
    }

    try {
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
        setRatings({
          ...ratings,
          [requestId]: "",
        });

        fetchRequests();
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not submit rating.");
    }
  };

  const getReviewDeadlineText = (reviewDeadline) => {
    if (!reviewDeadline) {
      return null;
    }

    const now = new Date();
    const deadline = new Date(reviewDeadline);
    const difference = deadline - now;

    if (difference <= 0) {
      return "Review period expired";
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

  return (
    <div className="page requests-container">
      <div className="requests-header">
        <span className="home-kicker">
          Your meal activity
        </span>

        <h1>My Requests</h1>

        <p>
          Track your meal requests, pickup status and reviews.
        </p>
      </div>

      {message && (
        <p className="message">{message}</p>
      )}

      {penaltiesApplied > 0 && (
        <div className="request-warning">
          {penaltiesApplied} review penalty
          {penaltiesApplied > 1 ? "ies were" : " was"} applied
          because the 48-hour review deadline expired.
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state">
          <h2>No meal requests yet</h2>

          <p>
            Browse available meals and request your first portion.
          </p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => {
            const reviewDeadlineText =
              getReviewDeadlineText(
                request.reviewDeadline
              );

            return (
              <div
                key={request.id}
                className="request-card"
              >
                <div className="request-card-main">
                  <div>
                    <span className="request-label">
                      Meal
                    </span>

                    <h3 className="request-title">
                      🍽{" "}
                      {request.listing?.title ||
                        "Unknown listing"}
                    </h3>

                    <p className="request-info">
                      Provider:{" "}
                      <strong>
                        {request.provider?.name ||
                          "Unknown provider"}
                      </strong>
                    </p>
                  </div>

                  <div
                    className={`status-badge status-${request.status
                      .toLowerCase()
                      .replace("_", "-")}`}
                  >
                    {request.status}
                  </div>
                </div>

                {request.status === "PENDING" && (
                  <div className="request-muted">
                    Waiting for the provider to approve or reject your request.
                  </div>
                )}

                {request.status === "APPROVED" && (
                  <div className="request-note">
                    Your portion is reserved. 1 point has been used for this reservation.
                  </div>
                )}

                {request.status === "REJECTED" && (
                  <div className="request-muted">
                    This request was rejected by the provider.
                  </div>
                )}

                {request.status === "NO_SHOW" && (
                  <div className="request-warning">
                    This meal was marked as a no-show. An additional point penalty was applied.
                  </div>
                )}

                {request.status === "PICKED_UP" &&
                  !request.rating && (
                    <>
                      <div className="request-complete">
                        ✓ Meal collected successfully.
                      </div>

                      {reviewDeadlineText && (
                        <div
                          className={
                            request.reviewPenaltyApplied
                              ? "request-warning"
                              : "review-deadline"
                          }
                        >
                          Review deadline:{" "}
                          <strong>
                            {reviewDeadlineText}
                          </strong>
                        </div>
                      )}

                      {!request.reviewPenaltyApplied && (
                        <div className="rating-box">
                          <div>
                            <p className="request-info">
                              Rate this meal
                            </p>

                            <small>
                              Submit your review within 48 hours to get your reservation point back.
                            </small>
                          </div>

                          <select
                            value={
                              ratings[request.id] || ""
                            }
                            onChange={(e) =>
                              handleRatingChange(
                                request.id,
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          >
                            <option value="">
                              Select rating
                            </option>

                            <option value="1">
                              ⭐ 1 - Poor
                            </option>

                            <option value="2">
                              ⭐⭐ 2 - Fair
                            </option>

                            <option value="3">
                              ⭐⭐⭐ 3 - Good
                            </option>

                            <option value="4">
                              ⭐⭐⭐⭐ 4 - Very Good
                            </option>

                            <option value="5">
                              ⭐⭐⭐⭐⭐ 5 - Excellent
                            </option>
                          </select>

                          <button
                            onClick={() =>
                              submitRating(
                                request.id
                              )
                            }
                          >
                            Submit Rating
                          </button>
                        </div>
                      )}
                    </>
                  )}

                {request.rating && (
                  <div className="completed-rating">
                    <span>
                      Your rating
                    </span>

                    <strong>
                      {"⭐".repeat(
                        request.rating
                      )}
                    </strong>

                    <small>
                      {request.rating}/5
                    </small>
                  </div>
                )}

                {request.rating &&
                  request.status ===
                    "PICKED_UP" && (
                    <div className="request-complete">
                      Review completed. Your reservation point was returned.
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyRequests;