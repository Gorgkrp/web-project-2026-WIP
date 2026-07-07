import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px",
      }}
    >
      <h1>🍽️ UniBite</h1>

      <h2>
        Share food. Reduce waste. Help fellow students.
      </h2>

      <p>
        UniBite connects students who have extra food with
        students looking for a meal.
      </p>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Link to="/register">
          <button>Register</button>
        </Link>

        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/listings">
          <button>Browse Meals</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;