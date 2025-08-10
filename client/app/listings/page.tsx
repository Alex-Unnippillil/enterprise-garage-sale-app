"use client";

import { useCallback, useEffect, useState } from "react";
import ListingCard, { Listing } from "@/components/ListingCard";
import ListingForm from "@/components/forms/ListingForm";
import { fetchListings } from "@/lib/api";

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const loadListings = useCallback(async () => {
    const result = await fetchListings({ q: query, page });
    setListings(result.listings);
    setPageCount(result.pageCount || 1);
  }, [query, page]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div className="space-y-6 p-6">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        placeholder="Search listings..."
        className="w-full rounded-md border p-2"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {pageCount}
        </span>
        <button
          className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= pageCount}
        >
          Next
        </button>
      </div>
      <ListingForm onSuccess={loadListings} />
    </div>
  );
};

export default ListingsPage;
