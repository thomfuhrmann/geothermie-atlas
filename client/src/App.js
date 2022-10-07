import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Map from "./pages/Map";
import About from "./pages/About";
import Impressum from "./pages/Impressum";
import Data from "./pages/Data";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Map theme="EWS" />} />
          <Route path="gwwp" element={<Map theme="GWWP" />} />
          <Route path="data" element={<Data />} />
          <Route path="about" element={<About />} />
          <Route path="impressum" element={<Impressum />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
