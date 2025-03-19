import React, { useState } from "react";
import Papa from "papaparse"; // Import PapaParse
import Layout from "../../components/Layout/Layout";
import "../../styles/Diet.css";

const Dietpage = () => {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [dietInfo, setDietInfo] = useState(null); // Store the result
  const [csvData, setCsvData] = useState([]); // Store CSV data
  const [submitted, setSubmitted] = useState(false); // Track if form is submitted

  // Load CSV file
  const loadCSV = () => {
    Papa.parse("/diet.csv", {
      download: true, // Enable file download
      header: true, // Treat the first row as headers
      complete: (result) => {
        setCsvData(result.data);
        console.log("CSV Loaded:", result.data);
      },
      error: (error) => {
        console.error("Error loading CSV:", error);
        alert("Failed to load CSV data.");
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (csvData.length === 0) {
      alert("CSV data is not loaded!");
      return;
    }

    // Filter CSV data based on user inputs
    const filteredData = csvData.find((row) => {
      const ageMatch = row.age === age;
      const genderMatch = row.gender?.toLowerCase() === gender.toLowerCase();
      const heightMatch = row.height === height;
      const weightMatch = row.weight === weight;

      return ageMatch && genderMatch && heightMatch && weightMatch;
    });

    if (filteredData) {
      setDietInfo(filteredData);
    } else {
      setDietInfo("No diet plan found for the given criteria.");
    }

    // Set form as submitted
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="diet-form-container">
       
        {!submitted ? (
          <>
            <button onClick={loadCSV} className="btn btn-secondary">
              Load Diet Data
            </button>
            <form className="diet-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="age">Age:</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  placeholder="Enter your age"
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">Height (cm):</label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                  placeholder="Enter your height in cm"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight (kg):</label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  placeholder="Enter your weight in kg"
                />
              </div>

              <div className="form-group">
                <label>Gender:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="male"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="female"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                    />
                    Female
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Get Diet Information
              </button>
            </form>
          </>
        ) : (
          <div className="diet-info">
            <h3>Diet Information</h3>
            {dietInfo ? (
              typeof dietInfo === "string" ? (
                <p>{dietInfo}</p>
              ) : (
                <ul>
                  {Object.entries(dietInfo).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p>No diet plan found for the given criteria.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dietpage;
