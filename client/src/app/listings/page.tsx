"use client";

import { useCallback, useEffect, useState } from "react";
import ListingCard from "@/components/listing-card";
import ListingForm from "@/components/forms/listing-form";
import { fetchListings } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Property } from "@/types/prisma-types";

const ListingsPage = () => {
  const [listings, setListings] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const loadListings = useCallback(async () => {
    const data = await fetchListings(debouncedQuery);
    setListings(data);
  }, [debouncedQuery]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div className="space-y-6 p-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings..."
        className="w-full rounded-md border p-2"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <ListingForm onSuccess={loadListings} />
    </div>
  );
};

export default ListingsPage;
