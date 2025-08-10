import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Property } from "@/types/prismaTypes"
import { Listing } from "@/components/ListingCard"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mapPropertyToListing = (property: Property): Listing => ({
  id: property.id,
  name: property.name,
  description: property.description,
  pricePerMonth: property.pricePerMonth,
  photoUrls: property.photoUrls,
})
