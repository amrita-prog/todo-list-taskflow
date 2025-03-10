import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth, useUserGuardContext } from "app";
import { TaskForm } from "components/TaskForm";
import { TaskItem } from "components/TaskItem";
import { useTaskStore, Priority } from "utils/taskStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Tasks() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();

  const { initializeTasks, cleanup, tasks, loading: tasksLoading } = useTaskStore();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // Initialize tasks subscription when component mounts
  useEffect(() => {
    if (user?.uid) {
      initializeTasks(user.uid);
    }
    
    // Cleanup subscription when component unmounts
    return () => {
      cleanup();
    };
  }, [user, initializeTasks, cleanup]);
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // Convert priority to numeric value for sorting
        const priorityValue = (p: Priority) => {
          if (p === 'high') return 3;
          if (p === 'medium') return 2;
          return 1;
        };
        return priorityValue(b.priority) - priorityValue(a.priority);
      }
    });
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900"
    >
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/logout")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Task management header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row justify-between items-center mb-6"
          >
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">My Tasks</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage all your tasks in one place</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter
                </label>
                <select
                  id="filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
                >
                  <option value="all">All Tasks</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                >
                  <option value="date">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Task creation form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Task</h3>
            <TaskForm onSuccess={() => {}} />
          </div>
          
          {/* Dashboard stats */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tasks</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{tasks.filter(t => t.completed).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{tasks.filter(t => !t.completed).length}</p>
            </div>
          </motion.div>
          
          {/* Task list */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Tasks</h3>
            
            {tasksLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                <AnimatePresence>
                  {filteredTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-600 dark:text-gray-400 italic text-center py-8"
              >
                No tasks found. Create your first task above.
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}