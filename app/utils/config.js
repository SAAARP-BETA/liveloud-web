// -------------------------------
// ✅ API Configuration
// -------------------------------
export const UNSPLASH_ACCESS_KEY = 'ytAR3Kj5h29tNC6hZMQLFY4uRK3rp-zzLLiEnOE5RyE';

export const API_ENDPOINTS = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_API_URL || "https://backend-4iko.onrender.com/api/auth",
  USER: process.env.NEXT_PUBLIC_USER_API_URL || "https://backend-4iko.onrender.com/api",
  SOCIAL: process.env.NEXT_PUBLIC_SOCIAL_API_URL || "https://backend-4iko.onrender.com/api/social",
  MEDIA: process.env.NEXT_PUBLIC_MEDIA_API_URL || "https://backend-4iko.onrender.com/api/upload",
  NOTIFICATION: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || "https://backend-4iko.onrender.com/api",
  MESSAGING: process.env.NEXT_PUBLIC_MESSAGING_API_URL || "https://backend-4iko.onrender.com/api",
  SEARCH: process.env.NEXT_PUBLIC_SEARCH_API_URL || "https://backend-4iko.onrender.com/api",
  POINTS: process.env.NEXT_PUBLIC_POINTS_API_URL || "https://backend-4iko.onrender.com/api/points",
};
//✅ General API Helpers
// -------------------------------
export const fetchFromApi = async (endpoint, path, options = {}) => {
  try {
    const baseUrl = API_ENDPOINTS[endpoint];
    if (!baseUrl) throw new Error(`Endpoint '${endpoint}' is not defined.`);

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${baseUrl}/${cleanPath}`;

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

export const postToApi = async (endpoint, path, data, headers = {}) => {
  return fetchFromApi(endpoint, path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  });
};

export const putToApi = async (endpoint, path, data, headers = {}) => {
  return fetchFromApi(endpoint, path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  });
};

export const deleteFromApi = async (endpoint, path, headers = {}) => {
  return fetchFromApi(endpoint, path, {
    method: 'DELETE',
    headers
  });
};

// -------------------------------
// ✅ Search Service
// -------------------------------
// export const searchService = {
//   async globalSearch(query, type = 'all', page = 1, limit = 10) {
//     const params = new URLSearchParams({
//       query,
//       type,
//       page: page.toString(),
//       limit: limit.toString()
//     });

//     const response = await fetch(`${API_ENDPOINTS.SEARCH}/?${params}`);
    
//     if (!response.ok) {
//       throw new Error(`Search failed: ${response.status}`);
//     }
    
//     return response.json();
//   },

//   async getSuggestions(query) {
//     const params = new URLSearchParams({ query });
//     const response = await fetch(`${API_ENDPOINTS.SEARCH}/suggestions?${params}`);
    
//     if (!response.ok) {
//       throw new Error(`Suggestions failed: ${response.status}`);
//     }
    
//     return response.json();
//   }
// };
// -------------------------------
// ✅ API Configuration
// -------------------------------



