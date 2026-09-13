import { useEffect, useState } from "react";

function ProviderRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must be logged in.");
        setRequests([]);
        return;
      }

      const response = await fetch(
        "http://localhost:3000/listings/requests/provider",
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

      setRequests(Array.isArray(data) ? data : []);
      setMessage("");
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to the server.");
      setRequests([]);
    }
  };

  const approveRequest = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/listings/requests/${id}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      fetchRequests();
    }
  };

  const rejectRequest = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/listings/requests/${id}/reject`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      fetchRequests();
    }
  };

  const markPickedUp = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/listings/requests/${id}/picked-up`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      fetchRequests();
    }
  };

  const markNoShow = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/listings/requests/${id}/no-show`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      <div className="requests-header">
        <span className="home-kicker">Meals you shared</span>

        <h1>Provider Requests</h1>

        <p>
          Manage requests for your meals and confirm whether each meal was
          successfully collected.
        </p>
      </div>

      {message && <p className="message">{message}</p>}

      {requests.length === 0 ? (
        <div className="empty-state">
          <h2>No requests yet</h2>
          <p>
            When another student requests one of your meals, it will appear
            here.
          </p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card provider-request-card">
              <div className="request-card-main">
                <div>
                  <span className="request-label">Meal</span>

                  <h3 className="request-title">
                    🍽 {request.listing?.title || "Unknown listing"}
                  </h3>

                  <p className="request-info">
                    Requested by{" "}
                    <strong>
                      {request.requester?.name || "Unknown user"}
                    </strong>
                  </p>

                  {request.requester?.credits !== undefined && (
                    <p className="request-info">
                      Requester points:{" "}
                      <strong>{request.requester.credits}</strong>
                    </p>
                  )}
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
                <div className="request-actions">
                  <button onClick={() => approveRequest(request.id)}>
                    Approve Request
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => rejectRequest(request.id)}
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status === "APPROVED" && (
                <>
                  <div className="request-note">
                    The portion has been reserved. Confirm what happened after
                    the pickup time.
                  </div>

                  <div className="request-actions">
                    <button onClick={() => markPickedUp(request.id)}>
                      ✓ Mark Picked Up
                    </button>

                    <button
                      className="danger-button"
                      onClick={() => markNoShow(request.id)}
                    >
                      No Show
                    </button>
                  </div>
                </>
              )}

              {request.status === "PICKED_UP" && (
                <div className="request-complete">
                  ✓ Meal successfully collected. The requester can now leave a
                  review.
                </div>
              )}

              {request.status === "NO_SHOW" && (
                <div className="request-warning">
                  The requester did not collect this meal and received the
                  no-show penalty.
                </div>
              )}

              {request.status === "REJECTED" && (
                <div className="request-muted">
                  This request was rejected.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderRequests;