import axios from 'axios';
import { Property } from '@/types/prisma-types';
import { env } from '@/env';

const API_URL = env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export const fetchListings = async (search?: string): Promise<Property[]> => {
  const response = await api.get('/properties', { params: { q: search } });
  return response.data as Property[];
};

export const createListing = async (data: any) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'photos' && Array.isArray(value)) {
      value.forEach((file) => formData.append('photos', file as any));
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
