"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import ListingCard, { Listing } from "@/components/ListingCard";
import ListingForm from "@/components/forms/ListingForm";
import { fetchListings } from "@/lib/api";

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSetQuery = useMemo(
    () => debounce((val: string) => setQuery(val), 300),
    []
  );

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings(query);
      setListings(data);
    } catch (err) {
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  return (
    <div className="space-y-6 p-6">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
        placeholder="Search listings..."
        className="w-full rounded-md border p-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
      <ListingForm onSuccess={loadListings} />
    </div>
  );
};

export default ListingsPage;
