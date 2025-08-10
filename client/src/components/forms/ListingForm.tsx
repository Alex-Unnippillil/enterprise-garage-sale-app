import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "@/components/FormField";
import { createListing } from "@/lib/api";

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
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
        <CustomFormField name="title" label="Title" />
        <CustomFormField name="description" label="Description" type="textarea" />
        <CustomFormField name="price" label="Price" type="number" />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ListingForm;
