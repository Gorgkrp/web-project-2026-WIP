import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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

    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    setMessage(data.message);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <br />
        <br />

        <button type="submit">Register</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Register;