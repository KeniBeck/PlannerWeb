import { authService } from "@/services/authService";
import { Navigate, replace } from "react-router";

const Home = () => {
  if (authService.isLocallyAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <>
      <div className="w-full h-full  flex justify-center items-center relative">
      </div>
    </>
  );
};
export default Home;