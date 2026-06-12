/**
 * Get the current API base path based on the current route
 * This allows the app to work with any route structure
 */
export function getApiBasePath(): string {
  if (typeof window === 'undefined') {
    // Server-side: return default path
    return '/defi-agent/api';
  }

  // Client-side: determine from current pathname
  const pathname = window.location.pathname;
  
  // Extract the base route (everything before /api)
  const segments = pathname.split('/').filter(Boolean);
  
  // Find the route that contains API endpoints
  // Examples:
  // /defi-agent/api/chat -> /defi-agent/api
  // /custom-agent/api/chat -> /custom-agent/api
  // /dashboard/api/data -> /dashboard/api
  
  if (pathname.includes('/api/')) {
    // If we're already in an API route, get the base
    const apiIndex = pathname.indexOf('/api/');
    return pathname.substring(0, apiIndex + 4); // Include '/api'
  }
  
  // If we're in a page route, construct the API path
  // /defi-agent -> /defi-agent/api
  // /custom-agent -> /custom-agent/api
  if (segments.length > 0) {
    return `/${segments[0]}/api`;
  }
  
  // Fallback to default
  return '/defi-agent/api';
}

/**
 * Get full API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  const basePath = getApiBasePath();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${basePath}/${cleanEndpoint}`;
}

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  chat: () => getApiUrl('chat'),
  history: () => getApiUrl('history'),
  filesUpload: () => getApiUrl('files/upload'),
  document: () => getApiUrl('document'),
  suggestions: () => getApiUrl('suggestions'),
  vote: () => getApiUrl('vote'),
} as const;
