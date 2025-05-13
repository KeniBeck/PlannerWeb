import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { decodeToken } from "@/lib/utils/jwtutils";

export const DashboardHeader = () => {
  const [greeting, setGreeting] = useState("");
  const [userData, setUserData] = useState<{ name: string; username: string } | null>(null);

  // Get current time-based greeting and user data
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");

    // Get user data from token
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserData({
          name: decoded.name || '',
          username: decoded.username || decoded.sub || '',
        });
      }
    }
  }, []);

  // Get today's date in Spanish format
  const today = format(new Date(), "EEEE dd 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar con inicial del usuario */}
        {userData && (
          <div className="hidden sm:flex">
            <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-200">
              {userData.name?.charAt(0).toUpperCase() || <FaUserCircle size={24} />}
            </div>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}{userData ? `, ${userData.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 capitalize">{today}</p>
        </div>
      </div>
      <div className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-blue-600 font-bold  border border-blue-200">
        <AiOutlineClockCircle />
        <span className="font-medium">{format(new Date(), "hh:mm a")}</span>
      </div>
    </div>
  );
};