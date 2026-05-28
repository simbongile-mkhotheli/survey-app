import axios from 'axios';
import { config } from '@/constants/appConfig';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
