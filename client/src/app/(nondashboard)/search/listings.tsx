import {
  useAddFavoriteMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prisma-types";
import { Favorite } from "@/types/favorite";
import Card from "@/components/card";
import React from "react";
import CardCompact from "@/components/card-compact";

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: favorites } = useGetFavoritesQuery(undefined, {
    skip: !authUser,
  });
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = favorites?.some(
      (fav: Favorite) => fav.propertyId === propertyId
    );
    const favoriteId = favorites?.find(
      (fav: Favorite) => fav.propertyId === propertyId
    )?.id;

    if (isFavorite && favoriteId) {
      await removeFavorite(favoriteId);
    } else {
      await addFavorite({ propertyId });
    }
  };

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties?.map((property) =>
            viewMode === "grid" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  favorites?.some(
                    (fav: Favorite) => fav.propertyId === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  favorites?.some(
                    (fav: Favorite) => fav.propertyId === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
