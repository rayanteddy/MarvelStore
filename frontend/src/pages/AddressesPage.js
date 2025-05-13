import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { Icon } from "@iconify/react";

const italianCities = [
  { value: "Parma", label: "Parma" },
  { value: "Bologna", label: "Bologna" },
  { value: "Modena", label: "Modena" },
  { value: "Reggio Emilia", label: "Reggio Emilia" },
  { value: "Ferrara", label: "Ferrara" },
];

const AddressesPage = () => {
  const [country, setCountry] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [province, setProvince] = useState("");
  const [consent, setConsent] = useState(false);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchAddresses(parsedUser._id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Function address
  const fetchAddresses = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/addresses?userId=${userId}`);
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error retrieving addresses", error);
    }
  };

  // Function save
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || !user._id) {
      alert("Error: User not logged in !");
      return;
    }
  
    if (!country || !fullName || !phoneNumber || !address || !selectedCity || !zipCode || !province) {
      alert("Please fill in all required fields..");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id, 
          country,
          fullName,
          phoneNumber,
          address,
          city: selectedCity.value,
          zipCode,
          province,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Address save !");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("An error occurred..");
    }
  };
  
  // FUnction delete
  const handleDelete = async (id) => {
    if (!id || !user || !user._id) {
      console.error("Missing ID or userId");
      alert("Error: User not logged in !");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/addresses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }
  
      setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr._id !== id));
      alert("Adresse supprimée !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.message);
      alert(error.message);
    }
  };
  
  //Function disconnection
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div style={{
      backgroundImage: `url('/assets/marvelstoreaddresse.jpeg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      paddingTop: "80px",
      color: "#fff"
    }}>
      {/* Navigation bar */}
      <header style={{ display: "flex", flexDirection: "column", backgroundColor: "#222", color: "white", padding: "10px 1px", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10 }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
          {[{ path: "/", icon: "mdi:home" }, { path: "/products", icon: "mdi:shopping" }, { path: "/cart", icon: "mdi:cart" }, { path: "/orders", icon: "mdi:package-variant-closed" }, { path: "/account", icon: "mdi:account" }, { path: "/addresses", icon: "mdi:map-marker" }].map((item) => (
            <Link key={item.path} to={item.path} className="nav-link">
              <Icon icon={item.icon} width="32" color={location.pathname === item.path ? "red" : "white"} />
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          <h1>🛍️ Address Management</h1>
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

      <div style={{ maxWidth: "500px", margin: "auto", textAlign: "left" }}>
        <h2>🏠 My Address</h2>
        <p>Add or change your shipping addresses</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select value={country} onChange={(e) => setCountry(e.target.value)} required>
            <option value="">Select a country</option>
            <option value="Italie">Italy</option>
          </select>
          <input type="text" placeholder="First name and last name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input type="tel" placeholder="Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          <Select options={italianCities} value={selectedCity} onChange={setSelectedCity} placeholder="Select a city" isSearchable />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <input type="text" placeholder="Postal code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
          <input type="text" placeholder="Province" value={province} onChange={(e) => setProvince(e.target.value)} required />
          <label>
            <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} required />
            I agree that this address will be used for delivery.
          </label>
          <button type="submit">Save address</button>
          {addresses.length > 0 ? (
        <ul>
          {addresses.map((addr) => (
            <li key={addr._id}>
              {addr.fullName} - {addr.address}, {addr.city} ({addr.zipCode})
              <button onClick={() => handleDelete(addr._id)}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No registered address.</p>
      )}
        </form>
      </div>
    </div>
  );
};

export default AddressesPage;
