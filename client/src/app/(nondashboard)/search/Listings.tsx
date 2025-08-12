import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from '@/state/api';
import { setFilters } from '@/state';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { Property } from '@/types/prismaTypes';
import Card from '@/components/Card';
import React from 'react';
import CardCompact from '@/components/CardCompact';
import Pagination from '@/components/Pagination';

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(authUser?.cognitoInfo?.userId || '', {
    skip: !authUser?.cognitoInfo?.userId,
  });
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);

  const { data: propertyData, isLoading, isError } = useGetPropertiesQuery(filters);

  const properties = propertyData?.properties || [];
  const total = propertyData?.total || 0;

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = tenant?.favorites?.some((fav: Property) => fav.id === propertyId);

    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    } else {
      await addFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    }
  };

  if (isLoading) return <>Loading...</>;
  if (isError || !propertyData) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {total} <span className="text-gray-700 font-normal">Places in {filters.location}</span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties.map((property) =>
            viewMode === 'grid' ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some((fav: Property) => fav.id === property.id) || false
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
                  tenant?.favorites?.some((fav: Property) => fav.id === property.id) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            ),
          )}
        </div>
      </div>
      {total > filters.pageSize && (
        <Pagination
          page={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onPageChange={(page) => dispatch(setFilters({ page }))}
        />
      )}
    </div>
  );
};

export default Listings;
