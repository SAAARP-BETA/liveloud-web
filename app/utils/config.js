export const UNSPLASH_ACCESS_KEY = 'ytAR3Kj5h29tNC6hZMQLFY4uRK3rp-zzLLiEnOE5RyE';

export const API_ENDPOINTS = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_API_URL,
};

// -------------------------------
// ✅ Helper for GET Requests
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

// -------------------------------
// ✅ Helper for POST
// -------------------------------
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

// -------------------------------
// ✅ Helper for PUT
// -------------------------------
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

// -------------------------------
// ✅ Helper for DELETE
// -------------------------------
export const deleteFromApi = async (endpoint, path, headers = {}) => {
  return fetchFromApi(endpoint, path, {
    method: 'DELETE',
    headers
  });
};
