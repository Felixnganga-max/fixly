import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import TechnicianCard from "../components/Testimonials";
import TechnicianSection from "../components/TechnicianSection";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";

const Home = () => {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <Testimonials />
    </div>
  );
};

export default Home;
