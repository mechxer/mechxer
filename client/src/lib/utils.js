import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine class names with TailwindCSS
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount, currency = "USD") {
  // Convert cents to dollars if needed
  const value = typeof amount === 'number' ? amount : 0;
  const dollars = value >= 100 ? value / 100 : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(dollars);
}

// Format date
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString();
}

// Calculate time from now (e.g., "2 days ago")
export function timeFromNow(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now - dateObj;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate a random ID
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Extract error message from error object
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.response && error.response.data) {
    const { data } = error.response;
    if (data.message) return data.message;
    if (typeof data === 'string') return data;
  }
  
  if (error.message) return error.message;
  
  return 'An unknown error occurred';
}

// Validate email format
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Scrolls smoothly to an element by ID
export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// For skeleton loading pattern
export function getSkeletonStyles(size, type = "default") {
  switch (type) {
    case "circle":
      return `h-${size} w-${size} rounded-full bg-muted animate-pulse`;
    case "button":
      return `h-${size} w-full rounded-md bg-muted animate-pulse`;
    case "text":
      return `h-${size} w-full rounded bg-muted animate-pulse`;
    default:
      return `h-${size} w-full rounded bg-muted animate-pulse`;
  }
}
