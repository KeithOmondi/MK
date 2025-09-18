import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";


//import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* ✅ Protected routes 
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>  */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
