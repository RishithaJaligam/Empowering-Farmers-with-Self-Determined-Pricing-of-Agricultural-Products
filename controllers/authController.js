import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import axios from "axios"
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";
const apiKey = process.env.API_KEY;
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer, aadhaarNumber } =
      req.body;
    //validations
    console.log(req.body)
    if (!name) {
      return res.send({ error: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is Required" });
    }
    if (!aadhaarNumber) {
      return res.send({ message: "Answer is Required" });
    }
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    

    const response = await axios.post(
      "https://api.gridlines.io/aadhaar-api/boson/generate-otp",
      {
        aadhaar_number: aadhaarNumber,
        consent: "Y",
      },
      {
        headers: {
          "X-Auth-Type": "API-Key", // Set the auth type
          "X-API-Key": `Avf2Zr7cTrfN2BjVD4ZSKdve5lWKPmfz`, // Set the API key
          "Content-Type": "application/json", // Set the content type
        },
      }
    );

    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
      aadhaarNumber
    }).save();
    console.log(response.data);
    if (response.data.data.code == "1001") {
      res.status(200).json({
        message:
          "OTP sent to your registered mobile number. Check your mobile.",
        transactionId: response.data.data.transaction_id, // Make sure to capture transactionId from the response
      });
    } else if (response.data.data.code === "1008") {
      res
        .status(400)
        .json({
          code:1008,
          message:
            "Aadhaar number does not have a mobile number registered with it.",
        });
    } else if (response.data.data.code === "1011") {
      res
        .status(400)
        .json({
          message:
            "Exceeded maximum OTP generation limit. Please try again later.",
        });
    } else if (response.data.data.code === "1012") {
      res.status(400).json({ message: "Aadhaar number does not exist." });
    } else if (response.data.data.code === "INVALID_AADHAAR") {
      res.status(400).json({ message: "Invalid Aadhaar Number." });
    } else if (response.data.data.code === "OTP_ALREADY_SENT") {
      res
        .status(400)
        .json({ message: "OTP already sent. Please try after 60 seconds." });
    } else {
      res.status(500).json({ message: "Unknown error occurred." });
    }

    // res.status(201).send({
    //   success: true,
    //   message: "User Register Successfully",
    //   user,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

//POST LOGIN
export const verifyOtp= async(req,res)=>{
  const { otp, transactionId, shareCode, includeXml } = req.body; // Expecting these fields in the request body
  console.log(otp, transactionId)

  try {
    // Send request to the Gridlines API to submit the OTP
    const response = await axios.post('https://api.gridlines.io/aadhaar-api/boson/submit-otp', {
      otp: otp, // Include the OTP sent to the user's mobile
      transaction_id: transactionId, // Include the transaction ID from the previous request
      
    }, {
      headers: {
        'X-Auth-Type': 'API-Key', // Set the auth type
        'X-Transaction-ID': transactionId, // Set the transaction ID
        'X-API-Key': `Avf2Zr7cTrfN2BjVD4ZSKdve5lWKPmfz`, // Set the API key
        'Content-Type': 'application/json' // Set the content type
      }
    });

    // Handle the response from the API
    if (response.data.data.code=== '1002') {
      res.status(200).json({
        success:true,
        message: 'XML validated and parsed.',
        data: response.data.data // Assuming the returned data contains the Aadhaar information
      });
    } else if (response.data.data.code === '1003') {
      res.status(400).json({ message: 'Session Expired. Please start the process again.' });
    } else if (response.data.data.code === '1005') {
      res.status(400).json({ message: 'OTP attempts exceeded. Please start the process again.' });
    } else if (response.data.data.code === 'INVALID_OTP') {
      res.status(400).json({ message: 'Invalid OTP.' });
    } else if (response.data.data.code === 'NO_SHARE_CODE') {
      res.status(400).json({ message: 'No share code provided.' });
    } else if (response.data.data.code === 'WRONG_SHARE_CODE') {
      res.status(400).json({ message: 'Wrong share code.' });
    } else if (response.data.data.code === 'INVALID_SHARE_CODE') {
      res.status(400).json({ message: 'Invalid share code. Length should be 4 and should only contain numbers.' });
    } else {
      res.status(500).json({ message: 'Unknown error occurred.' });
    }
  } catch (error) {
    console.error('Error submitting OTP:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error submitting OTP', error: error.response ? error.response.data : error.message });
  }

  
}
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Emai is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
