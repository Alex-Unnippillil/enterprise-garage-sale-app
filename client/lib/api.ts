import axios from "axios";
import { mapPropertyToListing } from "./utils";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
});

export const fetchListings = async (search?: string) => {
  const response = await api.get("/properties", { params: { q: search } });
  return response.data.map(mapPropertyToListing);
};

export const createListing = async (data: any) => {
  const response = await api.post("/properties", data);
  return response.data;
};

export default api;
