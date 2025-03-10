import { auth } from "app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleLogout = async () => {
      try {
        await auth.signOut();
        console.log("User signed out successfully");
      } catch (error) {
        console.error("Error signing out:", error);
      } finally {
        navigate("/login");
      }
    };
    
    handleLogout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Logging out...</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">You will be redirected shortly.</p>
      </div>
    </div>
  );
}