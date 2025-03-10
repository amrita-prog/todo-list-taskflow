import { Task, useTaskStore } from "utils/taskStore";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  task: Task;
}

export function TaskItem({ task }: Props) {
  const { toggleTaskCompletion, deleteTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id!, !task.completed);
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      setIsDeleting(true);
      await deleteTask(task.id!);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className={`border rounded-md p-4 transition-all duration-200 ${task.completed ? 'bg-gray-50 dark:bg-gray-700/30' : 'bg-white dark:bg-gray-800'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={task.completed}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              onChange={handleToggleCompletion}
              id={`task-${task.id}`}
            />
          </div>
          <label 
            htmlFor={`task-${task.id}`}
            className={`ml-3 block text-lg font-medium cursor-pointer ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}
          >
            {task.title}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300' :
              'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {task.description && (
        <div className="mt-2 ml-8 text-sm text-gray-600 dark:text-gray-400">
          {task.description}
        </div>
      )}
      
      <div className="mt-2 ml-8 text-xs text-gray-500 dark:text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </div>
    </motion.div>
  );
}