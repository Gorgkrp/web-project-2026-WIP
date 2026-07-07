import { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
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

    console.log("Login button clicked");
    console.log(formData);

    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    console.log(data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    setMessage(data.message);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;