const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined. Falling back to localhost:5000.");
}

export default API_BASE_URL;
