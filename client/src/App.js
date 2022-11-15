import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Map from "./pages/Map";
import About from "./pages/About";
import Data from "./pages/Data";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path="ews" element={<Map theme="EWS" />} />
          <Route path="gwwp" element={<Map theme="GWWP" />} />
          <Route path="data" element={<Data />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
