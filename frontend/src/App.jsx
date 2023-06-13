import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Prices from "./components/Prices";
import Tengkulaks from "./components/Tengkulaks";
import "./App.css";
import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/*" element={<NotFound />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/tengkulaks" element={<Tengkulaks />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
