import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, token is likely expired or invalid
      localStorage.removeItem("token");
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Custom Global Cache Implementation ---
// This makes navigation instantly fast by caching GET requests for 2 minutes.
// The cache is completely wiped out whenever a mutation (POST, PUT, DELETE) occurs 
// to ensure the user never sees stale data after making a change.
const cache = new Map();
const originalGet = api.get;

api.get = async (url, config) => {
  const cacheKey = url + JSON.stringify(config?.params || {});
  const cachedData = cache.get(cacheKey);

  // Return cached response if it's less than 2 minutes old
  if (cachedData && Date.now() - cachedData.timestamp < 120000) {
    // Deep clone the response so components can't accidentally mutate the cache
    return Promise.resolve(JSON.parse(JSON.stringify(cachedData.response)));
  }

  // Otherwise, make the real network request
  const response = await originalGet.call(api, url, config);
  
  // Save clone to cache
  cache.set(cacheKey, { timestamp: Date.now(), response: JSON.parse(JSON.stringify(response)) });
  return response;
};

// Clear cache on any non-GET request
const methodsToClear = ['post', 'put', 'patch', 'delete'];
methodsToClear.forEach(method => {
  const original = api[method];
  api[method] = async (...args) => {
    cache.clear();
    return original.apply(api, args);
  };
});

export default api;
