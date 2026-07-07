import { useEffect, useState } from "react";

function ProviderRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:3000/listings/requests/provider",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setRequests(data);
  };

  const approveRequest = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/listings/requests/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchRequests();
  };

  const rejectRequest = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/listings/requests/${id}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchRequests();
  };

  const markPickedUp = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/listings/requests/${id}/picked-up`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchRequests();
  };

  const markNoShow = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/listings/requests/${id}/no-show`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchRequests();
  };

  return (
   <div className="page requests-container">
  <h1>Provider Requests</h1>

      {requests.map((request) => (
       <div
  key={request.id}
  className="request-card"
>
         <h3 className="request-title">
  🍽 {request.listing.title}
</h3>

          <p>Requested by: {request.requester.name}</p>

          <div
  className={`status-badge status-${request.status.toLowerCase().replace("_", "-")}`}
>
  {request.status}
</div>

          {request.status === "PENDING" && (
            <>
              <button onClick={() => approveRequest(request.id)}>
                Approve
              </button>

              <button onClick={() => rejectRequest(request.id)}>
                Reject
              </button>
            </>
          )}

          {request.status === "APPROVED" && (
            <>
              <button onClick={() => markPickedUp(request.id)}>
                Mark Picked Up
              </button>

              <button onClick={() => markNoShow(request.id)}>
                No Show
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProviderRequests;