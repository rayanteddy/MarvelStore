import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";

const AccountPage = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", number: "" });
  const [editMode, setEditMode] = useState({ name: false, email: false, password: false, number: false });
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.email) {
          console.error("❌ No users found. !");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/users/user/${storedUser.email}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("❌ Error loading account :", error);
      }
    };
    fetchUser();
  }, []);

  // Edit function
  const handleEditToggle = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Change function
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save function
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/user/${user.email}`, user, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("✅ Saved changes !");
    } catch (error) {
      console.error("❌ Error Saving :", error);
    }
  };

  // Deconnection function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", backgroundImage: "url('/assets/marvelstoreaccount.jpg')", backgroundSize: "cover", minHeight: "100vh", color: "#fff" }}>
      
      {/* Navigation bar */}
      <header style={{ display: "flex", flexDirection: "column", backgroundColor: "#222", color: "white", padding: "10px 1px", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10 }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
        {[
                    { path: "/", icon: "mdi:home" },
                    { path: "/products", icon: "mdi:shopping" },
                    { path: "/cart", icon: "mdi:cart" },
                    { path: "/orders", icon: "mdi:package-variant-closed" },
                    { path: "/account", icon: "mdi:account" },
                    { path: "/addresses", icon: "mdi:map-marker" },
                  ].map((item) => (
                    <Link key={item.path} to={item.path} className="nav-link">
                      <Icon icon={item.icon} width="32" color={location.pathname === item.path ? "red" : "white"} />
                    </Link>
                  ))}
                  {user.email === "rngasseu123@gmail.com" && (
                    <Link to="/admin" className="nav-link">
                      <Icon icon="mdi:shield-account" width="32" color={location.pathname === "/admin" ? "red" : "white"} />
                    </Link>
                  )}
                  {user.email === "rngasseu123@gmail.com" && (
                    <Link to="/add-product" className="nav-link">
                      <Icon icon= "mdi:plus-box" width="32" color={location.pathname === "/add-product" ? "red" : "white"} />
                    </Link>
                  )}
        </nav>
        
        {/* User bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          <h1>🛍️ Account Management</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon icon="mdi:account-circle" width="40" style={{ cursor: "pointer" }} />
            {user ? (
              <>
                <span style={{ marginLeft: "10px", fontSize: "16px" }}>{user.name}</span>
                <button onClick={handleLogout} style={{ marginLeft: "10px", backgroundColor: "red", color: "white", padding: "5px", borderRadius: "3px" }}>Disconnection</button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} style={{ marginLeft: "10px", backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "3px" }}>Login</button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div style={{ marginTop: "120px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2>👤 My account</h2>
        {message && <p style={{ color: message.includes("❌") ? "red" : "green" }}>{message}</p>}

        {/* User Information */}
        <div style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "20px", borderRadius: "10px", width: "80%", maxWidth: "400px" }}>
          
          {/* Name */}
          <label>Name :</label>
          {editMode.name ? (
            <input type="text" name="name" value={user.name} onChange={handleChange} />
          ) : (
            <p>{user.name} <button onClick={() => handleEditToggle("name")}>✏ Modifier</button></p>
          )}

          {/* Email */}
          <label>Email :</label>
          {editMode.email ? (
            <input type="text" name="email" value={user.email} onChange={handleChange} />
          ) : (
            <p>{user.email} <button onClick={() => handleEditToggle("email")}>✏ Modifier</button></p>
          )}

          {/* Password */}
          <label>Password :</label>
          {editMode.password ? (
            <input type="password" name="password" value={user.password} onChange={handleChange} />
          ) : (
            <p>******** <button onClick={() => handleEditToggle("password")}>✏ Modifier</button></p>
          )}

          {/* Number */}
          <label>Number :</label>
          {editMode.number ? (
            <input type="text" name="number" value={user.number} onChange={handleChange} />
          ) : (
            <p>{user.number || "Non renseigné"} <button onClick={() => handleEditToggle("number")}>✏ Modifier</button></p>
          )}

          <button onClick={handleSave} style={{ marginTop: "15px", backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>
            💾 Save
          </button>
          <button onClick={handleLogout} style={{ marginTop: "15px", backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>
            Disconnection
          </button>
        </div>

        {/* Link to account */}
        <div style={{ marginTop: "20px", backgroundColor: "rgba(0,0,0,0.7)", padding: "20px", borderRadius: "10px", width: "80%", maxWidth: "400px" }}>
          <h3>📌 Options to account</h3>
          <p><Link to="/orders" style={{ color: "white", textDecoration: "none" }}><Icon icon="mdi:package-variant-closed" width="24" /> My order</Link></p>
          <p><Link to="/support" style={{ color: "white", textDecoration: "none" }}><Icon icon="mdi:help-circle" width="24" /> Assistance Client</Link></p>
          <p><Link to="/" style={{ color: "white", textDecoration: "none" }}><Icon icon="mdi:home" width="24" /> Home</Link></p>
          <p><Link to="/addresses" style={{ color: "white", textDecoration: "none" }}><Icon icon="mdi:home-map-marker" width="24" /> My address</Link></p>
        </div>

        <button onClick={() => navigate("/products")} style={{ marginTop: "20px", backgroundColor: "gray", color: "white", padding: "10px", borderRadius: "5px", width: "80%", maxWidth: "400px" }}>
          ⬅ Back to Products
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
