import { getFirestore, collection, onSnapshot, query, where, orderBy, doc, Timestamp, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from 'app';
import { Priority, Task } from './taskStore';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Cache for tasks to support offline functionality
let tasksCache: { [userId: string]: Task[] } = {};

type Unsubscribe = () => void;

// Subscribe to real-time updates for user's tasks
export const subscribeToTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void
): Unsubscribe => {
  if (!userId) return () => {};
  
  // If we have cached data, provide it immediately while waiting for fresh data
  if (tasksCache[userId]) {
    onUpdate(tasksCache[userId]);
  }

  // Query without the orderBy clause to avoid the index requirement
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId)
    // Removed orderBy to avoid index errors, we'll sort client-side instead
  );

  // Set up real-time listener
  return onSnapshot(tasksQuery, (snapshot) => {
    const tasksData: Task[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      tasksData.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate.toDate(),
        priority: data.priority,
        completed: data.completed,
        createdAt: data.createdAt.toDate()
      });
    });
    
    // Update cache and notify subscribers
    tasksCache[userId] = tasksData;
    onUpdate(tasksData);
  }, (error) => {
    console.error('Error in tasks subscription:', error);
    
    // If we have cached data, at least return that on error
    if (tasksCache[userId]) {
      onUpdate(tasksCache[userId]);
    }
  });
};

// Add a new task with optimistic update
export const addTask = async (
  task: Omit<Task, 'id' | 'createdAt'>
): Promise<string> => {
  // Generate a unique ID
  const taskId = doc(collection(db, 'tasks')).id;
  
  const newTask = {
    ...task,
    id: taskId,
    createdAt: new Date(),
    completed: false
  };
  
  // Optimistically update the cache
  if (!tasksCache[task.userId]) {
    tasksCache[task.userId] = [];
  }
  
  tasksCache[task.userId] = [
    { ...newTask },
    ...tasksCache[task.userId]
  ];
  
  // Convert dates to Firestore Timestamps
  const taskWithTimestamps = {
    ...newTask,
    dueDate: Timestamp.fromDate(newTask.dueDate),
    createdAt: Timestamp.fromDate(newTask.createdAt),
  };
  
  // Save to Firestore
  try {
    await setDoc(doc(db, 'tasks', taskId), taskWithTimestamps);
    return taskId;
  } catch (error) {
    // On error, revert the optimistic update
    tasksCache[task.userId] = tasksCache[task.userId].filter(t => t.id !== taskId);
    throw error;
  }
};

// Update an existing task with optimistic update
export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  // Get the current task to update cache optimistically
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnapshot = await getDoc(taskRef);
  
  if (!taskSnapshot.exists()) {
    throw new Error('Task not found');
  }
  
  const taskData = taskSnapshot.data();
  const userId = taskData.userId;
  
  // Update the cache optimistically
  if (tasksCache[userId]) {
    tasksCache[userId] = tasksCache[userId].map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
  }
  
  // Prepare updates for Firestore
  const updatesWithTimestamps = { ...updates };
  if (updates.dueDate) {
    updatesWithTimestamps.dueDate = Timestamp.fromDate(updates.dueDate);
  }
  
  // Save to Firestore
  try {
    await setDoc(taskRef, updatesWithTimestamps, { merge: true });
  } catch (error) {
    // Revert optimistic update on error
    if (tasksCache[userId]) {
      // Try to get the original task data from Firestore
      try {
        const freshSnapshot = await getDoc(taskRef);
        if (freshSnapshot.exists()) {
          const freshData = freshSnapshot.data();
          tasksCache[userId] = tasksCache[userId].map(task => 
            task.id === taskId ? {
              ...task,
              ...freshData,
              dueDate: freshData.dueDate.toDate(),
              createdAt: freshData.createdAt.toDate()
            } : task
          );
        }
      } catch (revertError) {
        console.error('Error reverting cache after update failure:', revertError);
      }
    }
    throw error;
  }
};

// Delete a task with optimistic update
export const deleteTask = async (
  taskId: string,
  userId: string
): Promise<void> => {
  // Remove from cache optimistically
  if (tasksCache[userId]) {
    const removedTask = tasksCache[userId].find(task => task.id === taskId);
    tasksCache[userId] = tasksCache[userId].filter(task => task.id !== taskId);
    
    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      // Revert optimistic deletion on error
      if (removedTask && tasksCache[userId]) {
        tasksCache[userId] = [...tasksCache[userId], removedTask];
      }
      throw error;
    }
  } else {
    // If no cache, just delete from Firestore
    await deleteDoc(doc(db, 'tasks', taskId));
  }
};

// Toggle task completion status with optimistic update
export const toggleTaskCompletion = async (
  taskId: string,
  completed: boolean,
  userId: string
): Promise<void> => {
  return updateTask(taskId, { completed });
};

// Clear cache when needed (e.g., user logout)
export const clearTasksCache = (userId?: string) => {
  if (userId) {
    delete tasksCache[userId];
  } else {
    tasksCache = {};
  }
};
