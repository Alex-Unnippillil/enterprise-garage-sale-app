import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "../FormField";
import { createListing } from "@/lib/api";

const listingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.coerce.number().positive("Price must be positive"),
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
        <CustomFormField name="name" label="Property Name" />
        <CustomFormField name="description" label="Description" type="textarea" />
        <CustomFormField name="pricePerMonth" label="Price per Month" type="number" />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ListingForm;
