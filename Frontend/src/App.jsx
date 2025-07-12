import React from "react";
import Navbar from "./components/Navbar/Navbar";
import SwapForm from "./components/SwapForm";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="app">
      <Navbar />

      <SwapForm />
      <Footer />
    </div>
  );
};

export default App;
