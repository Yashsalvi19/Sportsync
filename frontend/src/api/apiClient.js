import axios from 'axios';
import { supabase } from '../lib/supabase.js';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Pointing to local Spring Boot server
});

// Add a request interceptor to automatically inject the Supabase JWT
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
