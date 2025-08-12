import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "../FormField";
import { createListing } from "@/lib/api";

const listingSchema = z.object({
  managerCognitoId: z.string().min(1, "Manager ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.coerce.number().positive("Price must be positive"),
  securityDeposit: z.coerce
    .number()
    .nonnegative("Security deposit must be zero or more"),
  applicationFee: z.coerce
    .number()
    .nonnegative("Application fee must be zero or more"),
  beds: z.coerce.number().int().positive("Beds must be at least 1"),
  baths: z.coerce.number().positive("Baths must be positive"),
  squareFeet: z.coerce.number().int().positive("Square feet must be positive"),
  propertyType: z.string().min(1, "Property type is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type ListingFormData = z.infer<typeof listingSchema>;

const ListingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  const onSubmit = async (data: ListingFormData) => {
    await createListing(data);
    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CustomFormField name="managerCognitoId" label="Manager ID" />
        <CustomFormField name="name" label="Property Name" />
        <CustomFormField name="description" label="Description" type="textarea" />
        <CustomFormField
          name="pricePerMonth"
          label="Price per Month"
          type="number"
        />
        <CustomFormField
          name="securityDeposit"
          label="Security Deposit"
          type="number"
        />
        <CustomFormField
          name="applicationFee"
          label="Application Fee"
          type="number"
        />
        <CustomFormField name="beds" label="Beds" type="number" />
        <CustomFormField name="baths" label="Baths" type="number" />
        <CustomFormField
          name="squareFeet"
          label="Square Feet"
          type="number"
        />
        <CustomFormField name="propertyType" label="Property Type" />
        <CustomFormField name="address" label="Address" />
        <CustomFormField name="city" label="City" />
        <CustomFormField name="state" label="State" />
        <CustomFormField name="country" label="Country" />
        <CustomFormField name="postalCode" label="Postal Code" />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ListingForm;
