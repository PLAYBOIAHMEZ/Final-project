import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "../index.css";

function CreateAccountPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const registerResponse = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (registerResponse.status === 201) {
        // After successful registration, login immediately
        const loginResponse = await axios.post(
          "http://localhost:5000/api/users/login",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("userId", loginResponse.data.userId);
        history.push("/profile");
      }
    } catch (err) {
      console.error("Error during registration:", err.response?.data);
      setError(err.response?.data?.message || "Failed to create an account.");
    }
  };

  return (
    <div className="create-account-container">
      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          padding: "20px",
          textAlign: "center",
          border: "5px solid pink",
          borderRadius: "40px",
        }}
      >
        <h2>Create Account</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "10px",
              border: "2px solid #ccc",
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "12px",
              border: "2px solid #ccc",
            }}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "10px",
              border: "2px solid #ccc",
            }}
          />
          {error && <p style={{ color: "red", margin: "10px 0" }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              margin: "10px",
              borderRadius: "30px",
              border: "none",
              background: "linear-gradient(45deg, #fe3072, #ff5948)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
          <p>
            By logging in, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>

        {/* Add Login Link */}
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <p>Already have an account?</p>
          <button
            onClick={() => history.push("/login")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #fe3072",
              backgroundColor: "white",
              color: "#fe3072",
              cursor: "pointer",
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountPage;
