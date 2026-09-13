import { useState } from "react";

function CreateListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    portions: 1,
    pickupLocation: "",
    pickupTime: "",
  });

  const [image, setImage] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [message, setMessage] = useState("");

  const allergensList = [
    "Gluten",
    "Milk",
    "Eggs",
    "Peanuts",
    "Nuts",
    "Soy",
    "Fish",
    "Shellfish",
    "Sesame",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAllergenChange = (allergen) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(
        selectedAllergens.filter(
          (item) => item !== allergen
        )
      );
    } else {
      setSelectedAllergens([
        ...selectedAllergens,
        allergen,
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("portions", formData.portions);
    data.append(
      "pickupLocation",
      formData.pickupLocation
    );
    data.append("pickupTime", formData.pickupTime);

    data.append(
      "allergens",
      selectedAllergens.join(", ")
    );

    if (image) {
      data.append("image", image);
    }

    try {
      const response = await fetch(
        "http://localhost:3000/listings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      setMessage(result.message);

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          portions: 1,
          pickupLocation: "",
          pickupTime: "",
        });

        setImage(null);
        setSelectedAllergens([]);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not create listing.");
    }
  };

  return (
    <div className="page create-listing-page">
      <div className="create-listing-header">
        <span className="home-kicker">
          Share with your community
        </span>

        <h1>Share a Meal</h1>

        <p>
          Have an extra portion? Let another student
          enjoy it instead of letting it go to waste.
        </p>
      </div>

      <form
        className="create-listing-form"
        onSubmit={handleSubmit}
      >
        <div className="create-form-section">
          <h2>Meal Details</h2>

          <label>Meal name</label>
          <input
            name="title"
            placeholder="e.g. Spaghetti Bolognese"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Tell students about the meal..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Available portions</label>
          <input
            name="portions"
            type="number"
            min="1"
            value={formData.portions}
            onChange={handleChange}
            required
          />
        </div>

        <div className="create-form-section">
          <h2>Pickup Details</h2>

          <label>Pickup location</label>
          <input
            name="pickupLocation"
            placeholder="e.g. Estia Building, Entrance A"
            value={formData.pickupLocation}
            onChange={handleChange}
            required
          />

          <label>Pickup time</label>
          <input
            name="pickupTime"
            placeholder="e.g. 19:00 - 20:00"
            value={formData.pickupTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="create-form-section">
          <h2>Meal Photo</h2>

          <p>
            Add a photo so students can see the meal.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

          {image && (
            <img
              className="image-preview"
              src={URL.createObjectURL(image)}
              alt="Meal preview"
            />
          )}
        </div>

        <div className="create-form-section">
          <h2>Allergens</h2>

          <p>
            Select any known allergens contained in the
            meal.
          </p>

          <div className="allergen-grid">
            {allergensList.map((allergen) => (
              <label
                key={allergen}
                className="allergen-option"
              >
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(
                    allergen
                  )}
                  onChange={() =>
                    handleAllergenChange(allergen)
                  }
                />

                {allergen}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="create-listing-button"
        >
          Share Meal
        </button>

        {message && (
          <p className="message">{message}</p>
        )}
      </form>
    </div>
  );
}

export default CreateListing;