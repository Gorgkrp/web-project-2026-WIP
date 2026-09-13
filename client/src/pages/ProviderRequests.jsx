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
      <h1>Provider Requests</h1>

      {message && <p className="message">{message}</p>}

      {requests.length === 0 ? (
        <p>No provider requests found.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="request-card">
            <h3 className="request-title">
              🍽 {request.listing?.title || "Unknown listing"}
            </h3>

            <p className="request-info">
              Requested by: {request.requester?.name || "Unknown user"}
            </p>

            <div
              className={`status-badge status-${request.status
                .toLowerCase()
                .replace("_", "-")}`}
            >
              {request.status}
            </div>

            {request.status === "PENDING" && (
              <div className="button-row">
                <button onClick={() => approveRequest(request.id)}>
                  Approve
                </button>

                <button onClick={() => rejectRequest(request.id)}>
                  Reject
                </button>
              </div>
            )}

            {request.status === "APPROVED" && (
              <div className="button-row">
                <button onClick={() => markPickedUp(request.id)}>
                  Mark Picked Up
                </button>

                <button onClick={() => markNoShow(request.id)}>
                  No Show
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ProviderRequests;