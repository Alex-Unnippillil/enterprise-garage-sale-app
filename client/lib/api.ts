import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
});

interface ListingParams {
  q?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const fetchListings = async (params?: ListingParams) => {
  const response = await api.get("/listings", { params });
  return {
    listings: response.data,
    total: Number(response.headers["x-total-count"] || 0),
    pageCount: Number(response.headers["x-page-count"] || 0),
  };
};

export const createListing = async (data: any) => {
  const response = await api.post("/listings", data);
  return response.data;
};

export default api;
