// DEPRECATED: Mock data is no longer used. 
// Data is now fetched from the backend API.
// This file is kept for reference but statusOptions and priorityOptions 
// have been moved to utils/dataTransform.js

// Re-export for backward compatibility
export { statusOptions, priorityOptions } from './utils/dataTransform';

// Empty teamMembers - will be loaded from API
export const teamMembers = [];