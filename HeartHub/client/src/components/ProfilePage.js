import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import "../index.css"; // Importing index.css

function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    interestedIn: "",
    bio: "",
    image: null,
    imagePreview: null,
  });
  const [error, setError] = useState("");
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    // Fetch existing profile if available
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.profile) {
          const { name, age, gender, interestedIn, bio } =
            response.data.profile;
          setFormData((prev) => ({
            ...prev,
            name: name || "",
            age: age || "",
            gender: gender || "",
            interestedIn: interestedIn || "",
            bio: bio || "",
            imagePreview: response.data.profile.imageUrl || null,
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Clear any previous error
      setError("");

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
      }));
    }
  };

  // Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (formData.imagePreview && !formData.imagePreview.startsWith("http")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    // Validate age
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 100) {
      setError("Please enter a valid age between 18 and 100");
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && key !== "imagePreview") {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/profile",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("userProfile", JSON.stringify(response.data.user));
        history.push("/dashboard");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        history.push("/login");
      } else {
        setError(err.response?.data?.message || "Failed to update profile");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "520px",
        padding: "20px",
        margin: "50px auto",
        textAlign: "center",
        border: "5px solid pink",
        borderRadius: "40px",
      }}
    >
      <h2>Create Your Profile</h2>
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div style={{ marginBottom: "15px" }}>
          <img
            src={formData.imagePreview || "/images/default-avatar.png"}
            alt="Profile Preview"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "50%",
              margin: "10px 0",
              border: "2px solid #ddd",
            }}
          />
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            style={{
              padding: "8px 16px",
              backgroundColor: "#fe3072",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              display: "inline-block",
              marginTop: "10px",
            }}
          >
            Choose Profile Picture
          </label>
        </div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          name="interestedIn"
          value={formData.interestedIn}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        >
          <option value="">Interested In</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <textarea
          name="bio"
          placeholder="Write about yourself..."
          value={formData.bio}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#fe3072",
            color: "white",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
