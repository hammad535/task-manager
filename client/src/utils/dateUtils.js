/**
 * Date utility functions for handling dates without timezone conversion
 * Treats dates as local dates (YYYY-MM-DD format) matching Monday.com behavior
 */

/**
 * Format a Date object to YYYY-MM-DD string using local timezone (no UTC conversion)
 * This prevents the "previous day" bug when selecting dates
 */
export const formatDateLocal = (date) => {
  if (!date) return null;
  
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string to Date object using local timezone
 */
export const parseDateLocal = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Try parsing as ISO string
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  
  return d;
};

/**
 * Format date for display (e.g., "Jan 30") matching Monday.com format
 */
export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  
  const date = parseDateLocal(dateStr);
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
export const getTodayLocal = () => {
  return formatDateLocal(new Date());
};
