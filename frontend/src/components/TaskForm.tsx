import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { firebaseAuth } from "app";
import { Priority, useTaskStore } from "utils/taskStore";

interface Props {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as Priority
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { addTask } = useTaskStore();
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current user from Firebase
      const auth = firebaseAuth;
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Create task with current date and user ID
      await addTask({
        userId,
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate),
        priority: formData.priority,
        completed: false
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium"
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setSubmitError("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Title field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder="Task title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Task description (optional)"
          />
        </div>
        
        {/* Due Date field */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
        </div>
        
        {/* Priority field */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        {/* Submit button */}
        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </motion.button>
        </div>
        
        {/* Submit error message */}
        {submitError && (
          <div className="text-red-600 text-sm mt-2 text-center">
            {submitError}
          </div>
        )}
      </div>
    </motion.form>
  );
}
