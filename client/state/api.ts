import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Listing {
  id: number | string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Listings"],
  endpoints: (build) => ({
    fetchListings: build.query<Listing[], string | void>({
      query: (search = "") => ({
        url: "properties",
        params: search ? { q: search } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Listings" as const, id })),
              { type: "Listings", id: "LIST" },
            ]
          : [{ type: "Listings", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to fetch listings", error);
        }
      },
    }),
    createListing: build.mutation<Listing, Partial<Listing>>({
      query: (body) => ({
        url: "properties",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Listings", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to create listing", error);
        }
      },
    }),
  }),
});

export const { useFetchListingsQuery, useCreateListingMutation } = api;
