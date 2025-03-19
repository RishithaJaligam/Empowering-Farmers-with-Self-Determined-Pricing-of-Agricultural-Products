import React from "react";
import Layout from "./../components/Layout/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommer app"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/about.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <p className="text-justify mt-2">
          This platform empowers farmers to set their own prices, eliminating middlemen and maximizing profits.
           It provides tools to detect organic and inorganic products, ensuring transparency for consumers. 
           With real-time price trend analysis, secure payment gateways, KYC authentication, and a feedback system, 
           the platform creates a trusted, efficient marketplace for direct buyer-seller engagement
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
