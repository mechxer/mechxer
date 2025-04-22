// Declare module for TanStack Query to extend types as needed
declare module '@tanstack/react-query' {
  // We're keeping only what's needed and removing QueryFunction that's causing errors
  export type QueryKey = readonly unknown[];
}