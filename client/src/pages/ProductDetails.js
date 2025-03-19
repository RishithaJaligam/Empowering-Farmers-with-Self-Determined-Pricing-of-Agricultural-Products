import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Papa from "papaparse"; // Import PapaParse
import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [nutritionData, setNutritionData] = useState({});

  // Fetch and parse the CSV file
  const fetchNutritionData = async () => {
    try {
      const response = await fetch("/nutrition_data.csv");
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          console.log("Parsed CSV Data:", result.data); // Log parsed CSV to check structure
          const nutritionMap = result.data.reduce((acc, item) => {
            acc[item["Product Name"]] = item; // Map each product's nutrition details
            return acc;
          }, {});
          setNutritionData(nutritionMap); // Set parsed nutrition data to state
        },
      });
    } catch (error) {
      console.error("Error fetching CSV file:", error);
    }
  };

  useEffect(() => {
    fetchNutritionData(); // Fetch CSV file on component mount
  }, []);

  // Fetch product details
  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/get-product/${params.slug}`
      );
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch related products
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  // Get nutrition info for the current product
  const currentProductNutrition = nutritionData[product.name] || {};

  return (
    <Layout>
      <div className="row container product-details">
        <div className="col-md-6">
          <img
            src={`http://localhost:8080/api/v1/product/product-photo/${product._id}`}
            className="card-img-top"
            alt={product.name}
            height={"300px"}
            width={"350px"}
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name: {product.name}</h6>
          <h6>Description: {product.description}</h6>
          <h6>
            Price:{" "}
            {product?.price?.toLocaleString("en-US", {
              style: "currency",
              currency: "INR",
            })}
          </h6>
      {currentProductNutrition && (
         <div className="nutrition-info">
          <h4>Nutrition Information</h4>
          <ul>
            <li>Protein: {currentProductNutrition["Protein (g)"] || "N/A"}g</li>
            <li>Fat: {currentProductNutrition["Fat (g)"] || "N/A"}g</li>
            <li>Calcium: {currentProductNutrition["Calcium (mg)"] || "N/A"}mg</li>
            <li>
              Carbohydrates: {currentProductNutrition["Carbohydrates (g)"] || "N/A"}g
            </li>
            <li>Vitamins: {currentProductNutrition["Vitamins"] || "N/A"}</li>
          </ul>
        
        </div>
      )}
          <h6>Category: {product?.category?.name}</h6>
          <button className="btn btn-secondary ms-1">ADD TO CART</button>
        </div>
       </div> 

{/* Nutrition Information */}

      <hr />
      <div className="row container similar-products">
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar Products found</p>
        )}
        <div className="d-flex flex-wrap">
          {relatedProducts?.map((p) => (
            <div className="card m-2" key={p._id}>
              <img
                src={`http://localhost:8080/api/v1/product/product-photo/${p._id}`}
                className="card-img-top"
                alt={p.name}
              />
              <div className="card-body">
                <div className="card-name-price">
                  <h5 className="card-title">{p.name}</h5>
                  <h5 className="card-title card-price">
                    {p.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h5>
                </div>
                <p className="card-text ">
                  {p.description.substring(0, 60)}...
                </p>
                <div className="card-name-price">
                  <button
                    className="btn btn-info ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
