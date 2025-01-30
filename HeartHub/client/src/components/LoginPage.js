import React, { useState } from "react";
import "../index.css"; // Importing index.css
import { useHistory } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);

        // Check if user has a profile
        const profileResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          }
        );

        if (profileResponse.data.hasProfile) {
          history.push("/dashboard");
        } else {
          history.push("/profile");
        }
      }
    } catch (error) {
      console.error("Login error:", error.response?.data);
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="login-container">
      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          padding: "20px",
          border: "5px solid pink",
          borderRadius: "40px",
        }}
      >
        <h2>Login</h2>
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "2px solid #ddd",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "2px solid #ddd",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "18px",
              borderRadius: "30px",
              border: "2px solid white",
              backgroundColor: "linear-gradient(135deg, #fe3072, #ff5948)",
              color: "#fe3072",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login
          </button>
        </form>

        {/* Add Create Account Link */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>Don't have an account?</p>
          <button
            onClick={() => history.push("/create-account")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",

              borderRadius: "30px",
              border: "none",
              background: "linear-gradient(45deg, #fe3072, #ff5948)",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
