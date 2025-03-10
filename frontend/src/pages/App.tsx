import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { SplashScreen } from "components/SplashScreen";
import { motion } from "framer-motion";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const { user, loading } = useCurrentUser();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Setting up your TaskFlow experience</p>
          </div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Please log in</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">You will be redirected to the login page shortly.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gray-100 dark:bg-gray-900"
        >
          <header className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
                <Link 
                  to="/logout"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </Link>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Welcome to TaskFlow!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Start managing your tasks today and boost your productivity.
                </p>
                <div className="mt-6">
                  <Link 
                    to="/tasks"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to My Tasks
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </>
  );
}