import { useState } from "react";

function CreateListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    portions: 1,
    pickupLocation: "",
    pickupTime: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    console.log(data);

    setMessage(data.message);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Create Listing</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Food title"
          value={formData.title}
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="portions"
          type="number"
          placeholder="Portions"
          value={formData.portions}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="pickupLocation"
          placeholder="Pickup location"
          value={formData.pickupLocation}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="pickupTime"
          placeholder="Pickup time"
          value={formData.pickupTime}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Create Listing
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default CreateListing;