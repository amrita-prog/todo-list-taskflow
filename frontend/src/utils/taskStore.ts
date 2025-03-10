import { create } from 'zustand';
import { 
  subscribeToTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  toggleTaskCompletion as toggleTaskService,
  clearTasksCache
} from './taskService';

// Task store with improved caching and real-time updates

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  initializeTasks: (userId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  cleanup: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: true,
  error: null,
  unsubscribe: null,
  
  initializeTasks: (userId: string) => {
    // Clear previous subscription if exists
    if (get().unsubscribe) {
      get().unsubscribe();
    }
    
    set({ loading: true, error: null });
    
    // Set up real-time subscription
    const unsubscribeFunc = subscribeToTasks(
      userId,
      (tasks) => {
        // Sort tasks client-side by createdAt desc
        const sortedTasks = [...tasks].sort((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        
        set({ 
          tasks: sortedTasks, 
          loading: false,
          error: null
        });
      }
    );
    
    set({ unsubscribe: unsubscribeFunc });
  },
  
  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe();
    }
    clearTasksCache();
    set({ tasks: [], unsubscribe: null });
  },
  
  addTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      // Use the service to add the task (which handles caching)
      const taskId = await addTaskService(taskData);
      set({ loading: false });
      return taskId;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: 'Failed to add task', loading: false });
      return null;
    }
  },
  
  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      // Use the service to update the task (which handles caching)
      await updateTaskService(taskId, updates);
      set({ loading: false });
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: 'Failed to update task', loading: false });
    }
  },
  
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      // Need to get the userId for the task
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      
      // Use the service to delete the task (which handles caching)
      await deleteTaskService(taskId, task.userId);
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Failed to delete task', loading: false });
    }
  },
  
  toggleTaskCompletion: async (taskId, completed) => {
    try {
      // Need to get the userId for the task
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      
      // Use the service to toggle completion (which handles caching)
      await toggleTaskService(taskId, completed, task.userId);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      set({ error: 'Failed to update task', loading: false });
    }
  }
}));
