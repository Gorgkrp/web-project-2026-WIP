import { Link } from "react-router-dom";

function Home() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker">Student food sharing</span>

          <h1>
            Good food should be shared,
            <span> not wasted.</span>
          </h1>

          <p>
            UniBite helps students share extra homemade food,
            discover available meals nearby, and reduce food waste
            across the university community.
          </p>

          <div className="home-actions">
            <Link to="/listings" className="home-primary-btn">
              Browse Meals
            </Link>

            {currentUser ? (
              <Link to="/create-listing" className="home-secondary-btn">
                Share a Meal
              </Link>
            ) : (
              <Link to="/register" className="home-secondary-btn">
                Join UniBite
              </Link>
            )}
          </div>
        </div>

        <div className="home-hero-visual">
          <img
            src="/images/hero-food.jpg"
            alt="Homemade food ready to be shared"
          />

          <div className="home-floating-card">
            <span>🍲</span>
            <div>
              <strong>Fresh meals nearby</strong>
              <p>Shared by fellow students</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <span>🍽️</span>
          <h3>Share extra food</h3>
          <p>
            Post available portions and help good food find a new home.
          </p>
        </div>

        <div className="home-feature-card">
          <span>🤝</span>
          <h3>Connect with students</h3>
          <p>
            Request meals, coordinate pickup, and support your university community.
          </p>
        </div>

        <div className="home-feature-card">
          <span>♻️</span>
          <h3>Reduce food waste</h3>
          <p>
            Give surplus food a second chance instead of throwing it away.
          </p>
        </div>
      </section>

      <section className="home-community">
        <img
          src="/images/community-food.jpg"
          alt="Students sharing food together"
        />

        <div>
          <span className="home-kicker">Built around community</span>

          <h2>More than just a meal.</h2>

          <p>
            UniBite makes it easier for students to help each other,
            discover homemade food and make better use of what is already available.
          </p>

          <Link to="/listings" className="home-primary-btn">
            Explore available meals
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;