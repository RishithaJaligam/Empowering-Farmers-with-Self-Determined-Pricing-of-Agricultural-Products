import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [aadhaarNumber, setAadharnumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false); // State to show/hide OTP input
  const navigate = useNavigate();

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if we are in the registration step or OTP verification step
      if (!showOtpInput) {
        // Registration step
        const res = await axios.post("http://localhost:8080/api/v1/auth/register", {
          name,
          email,
          password,
          phone,
          address,
          answer,
          aadhaarNumber,
        });
        setTransactionId(res.data.transactionId)

        if (res && res.data) {
          toast.success(res.data && res.data.message);
          if (res.data) {
            // Prompt for OTP input
            setShowOtpInput(true); // Show OTP input field
          }
        } else {
          toast.error(res.data.message);
        }
      } else {
        // OTP verification step
        const res = await axios.post("http://localhost:8080/api/v1/auth/verifyotp", {
          transactionId,
          otp,
        });

        if (res && res.data.success) {
          toast.success("OTP verified successfully!");
          
            navigate("/login");
          
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title="Register - Ecommer App">
      <div className="form-container" style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">REGISTER FORM</h4>
          {!showOtpInput ? (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="Enter Your Name"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter Your Email"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter Your Password"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="Enter Your Phone"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadharnumber(e.target.value)}
                  className="form-control"
                  placeholder="Enter Aadhaar Number"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-control"
                  placeholder="Enter Your Address"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="form-control"
                  placeholder="What is Your Favorite sport"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                REGISTER
              </button>
            </>
          ) : (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-control"
                  placeholder="Enter OTP"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                VERIFY OTP
              </button>
            </>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Register;
