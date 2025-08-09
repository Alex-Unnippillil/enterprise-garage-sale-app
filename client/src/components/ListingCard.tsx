import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface Listing {
  id: number | string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

const ListingCard = ({ listing }: { listing: Listing }) => {
  return (
    <Card className="overflow-hidden">
      {listing.imageUrl && (
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          width={400}
          height={200}
          className="h-48 w-full object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold">{listing.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-600">{listing.description}</p>
        <p className="font-semibold">${listing.price}</p>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
