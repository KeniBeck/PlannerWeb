import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import Login from "./views/Login";
import { ProtectedRoute } from "./middleware/ProtectedRoute";
import Forbidden from "./views/Foorbiden";
import Dashboard from "./views/Dashboard";
import ServerStatusBanner from "./components/dialog/ServerStatusBanner";
import { Feature, LayeredProviders } from "./contexts/LayeredProviders";
import { NotificationProvider } from "./contexts/NotificationContext";

const App = () => {
  return (
    <>
      <NotificationProvider>
        <ServerStatusBanner />
        <Router basename="/CargoPlanner-Web">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <LayeredProviders features={[Feature.PROGRAMMING]}>
                    <Dashboard />
                  </LayeredProviders>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </>
  );
};

export default App;
