"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  X,
  Home,
  Car,
  Wifi,
  Snowflake,
  UtensilsCrossed
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, toggleFiltersFullOpen } from "@/state";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, className }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state: any) => state.global.filters);
  const isFiltersFullOpen = useSelector((state: any) => state.global.isFiltersFullOpen);

  const [localFilters, setLocalFilters] = useState({
    location: filters.location,
    priceRange: filters.priceRange,
    beds: filters.beds,
    baths: filters.baths,
    propertyType: filters.propertyType,
    amenities: filters.amenities,
    highlights: [],
    squareFeet: filters.squareFeet,
    availableFrom: filters.availableFrom,
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    dispatch(setFilters(localFilters));
    onSearch(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: "Los Angeles",
      beds: "any",
      baths: "any",
      propertyType: "any",
      amenities: [],
      priceRange: [null, null],
      squareFeet: [null, null],
      availableFrom: "any",
      coordinates: [-118.25, 34.05],
    };
    setLocalFilters(resetFilters);
    dispatch(setFilters(resetFilters));
    onSearch(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.location !== "Los Angeles") count++;
    if (localFilters.beds !== "any") count++;
    if (localFilters.baths !== "any") count++;
    if (localFilters.propertyType !== "any") count++;
    if (localFilters.amenities.length > 0) count++;
    if (localFilters.highlights.length > 0) count++;
    if (localFilters.priceRange[0] !== null || localFilters.priceRange[1] !== null) count++;
    if (localFilters.squareFeet[0] !== null || localFilters.squareFeet[1] !== null) count++;
    if (localFilters.availableFrom !== "any") count++;
    return count;
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      {children}
    </div>
  );

  const AmenityCheckbox = ({ amenity, label, icon: Icon }: { 
    amenity: string; 
    label: string; 
    icon: React.ElementType;
  }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={amenity}
        checked={localFilters.amenities.includes(amenity)}
        onCheckedChange={(checked) => {
          if (checked) {
            handleFilterChange("amenities", [...localFilters.amenities, amenity]);
          } else {
            handleFilterChange("amenities", localFilters.amenities.filter((a: string) => a !== amenity));
          }
        }}
      />
      <Label htmlFor={amenity} className="flex items-center gap-2 text-sm cursor-pointer">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
    </div>
  );

  return (
    <div className={className}>
      {/* Quick Search Bar */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by location, property name, or address..."
            value={localFilters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(toggleFiltersFullOpen())}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {isFiltersFullOpen && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Location */}
              <FilterSection title="Location">
                <div className="space-y-2">
                  <Input
                    placeholder="City, State, or ZIP"
                    value={localFilters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>
              </FilterSection>

              {/* Property Type */}
              <FilterSection title="Property Type">
                <Select
                  value={localFilters.propertyType}
                  onValueChange={(value) => handleFilterChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    {Object.keys(PropertyTypeEnum).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      ${localFilters.priceRange[0] || 0} - ${localFilters.priceRange[1] || 10000}
                    </span>
                  </div>
                  <Slider
                    value={localFilters.priceRange.map(v => v || 0)}
                    onValueChange={(value) => handleFilterChange("priceRange", value)}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Beds & Baths */}
              <FilterSection title="Bedrooms">
                <Select
                  value={localFilters.beds}
                  onValueChange={(value) => handleFilterChange("beds", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              <FilterSection title="Bathrooms">
                <Select
                  value={localFilters.baths}
                  onValueChange={(value) => handleFilterChange("baths", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2.5">2.5</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Square Feet */}
              <FilterSection title="Square Feet">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {localFilters.squareFeet[0] || 0} - {localFilters.squareFeet[1] || 5000} sq ft
                    </span>
                  </div>
                  <Slider
                    value={localFilters.squareFeet.map(v => v || 0)}
                    onValueChange={(value) => handleFilterChange("squareFeet", value)}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
              </FilterSection>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <FilterSection title="Amenities">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <AmenityCheckbox amenity="WasherDryer" label="Washer/Dryer" icon={Home} />
                  <AmenityCheckbox amenity="AirConditioning" label="Air Conditioning" icon={Snowflake} />
                  <AmenityCheckbox amenity="Dishwasher" label="Dishwasher" icon={UtensilsCrossed} />
                  <AmenityCheckbox amenity="HighSpeedInternet" label="High Speed Internet" icon={Wifi} />
                  <AmenityCheckbox amenity="Parking" label="Parking" icon={Car} />
                  <AmenityCheckbox amenity="PetsAllowed" label="Pets Allowed" icon={Home} />
                </div>
              </FilterSection>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch; 