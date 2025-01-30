import React from "react";
import { useHistory } from "react-router-dom";
import logoSmall from "../images/logo-small.png"; // Make sure this path is correct

import "../index.css"; // Ensure the CSS file exists

function Homepage() {
  const history = useHistory();

  return (
    <div
      className="overlay"
      style={{
        textAlign: "center",
        padding: "7px",
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
        position: "relative",
      }}
    >
      <img
        src={logoSmall}
        alt="HeartHub Logo"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "120px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
        }}
      >
        <h1 style={{ color: "white", fontSize: "42px", marginBottom: "20px" }}>
          HeartHub
        </h1>
        <p style={{ color: "white", fontSize: "20px", marginBottom: "40px" }}>
          Where Hearts Meet
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => history.push("/create-account")}
            style={{
              padding: "16px 32px",
              width: "280px",
              fontSize: "18px",
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
          <button
            onClick={() => history.push("/login")}
            style={{
              padding: "15px 30px",
              width: "280px",
              fontSize: "18px",
              borderRadius: "30px",
              border: "2px solid white",
              backgroundColor: "transparent",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
