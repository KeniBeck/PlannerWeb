import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AiOutlineClockCircle } from "react-icons/ai";

export const DashboardHeader = () => {
  const [greeting, setGreeting] = useState("");

  // Get current time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  // Get today's date in Spanish format
  const today = format(new Date(), "EEEE dd 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{greeting}</h1>
        <p className="text-gray-500 capitalize">{today}</p>
      </div>
      <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-blue-600">
        <AiOutlineClockCircle />
        <span className="font-medium">{format(new Date(), "hh:mm a")}</span>
      </div>
    </div>
  );
};