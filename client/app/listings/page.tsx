"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingForm from "@/components/forms/ListingForm";
import { useFetchListingsQuery } from "@/state/api";

const ListingsPage = () => {
  const [query, setQuery] = useState("");
  const { data: listings = [], error, refetch } = useFetchListingsQuery(query);

  return (
    <div className="space-y-6 p-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings..."
        className="w-full rounded-md border p-2"
      />
      {error && (
        <p className="text-sm text-red-500">Failed to load listings.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <ListingForm onSuccess={refetch} />
    </div>
  );
};

export default ListingsPage;
