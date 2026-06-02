import { useEffect, useState } from "react";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HotAuctions from "./components/Home/HotAuctions";
import TabsNavigation from "../src/pages/AuctionManagement/TabsNavigation";
import LoginPopup from "./components/LoginPopup";
import Enquiries from "./pages/Enquiries";

const App = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
        <Route exact path="/auction" element={<HotAuctions theme={theme} onToggleTheme={toggleTheme} />} />
        <Route exact path="/auction-details/:auctionId" element={<TabsNavigation theme={theme} onToggleTheme={toggleTheme} />}/>
        <Route exact path="/enquiries" element={<Enquiries theme={theme} onToggleTheme={toggleTheme} />} />
        <Route exact path="/enquiries/manage" element={<Enquiries theme={theme} onToggleTheme={toggleTheme} />} />
      </Routes>
      <LoginPopup />
    </BrowserRouter>
  );
};

export default App;
