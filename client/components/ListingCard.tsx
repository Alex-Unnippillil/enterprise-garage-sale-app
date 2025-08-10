import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface Listing {
  id: number | string;
  name: string;
  description: string;
  pricePerMonth: number;
  photoUrls?: string[];
}

const ListingCard = ({ listing }: { listing: Listing }) => {
  return (
    <Card className="overflow-hidden">
      {listing.photoUrls?.[0] && (
        <Image
          src={listing.photoUrls[0]}
          alt={listing.name}
          width={400}
          height={200}
          className="h-48 w-full object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold">{listing.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-600">{listing.description}</p>
        <p className="font-semibold">${listing.pricePerMonth}</p>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
