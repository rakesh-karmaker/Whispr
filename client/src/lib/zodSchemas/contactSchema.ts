import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const createGroupFormSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  groupImage: z
    .any()
    .nullable()
    .refine(
      (value) =>
        typeof value === "string"
          ? true
          : value?.length > 0 &&
            value?.[0]?.size <= MAX_FILE_SIZE &&
            ACCEPTED_IMAGE_TYPES.includes(value?.[0]?.type),
      {
        message: `Max image size is ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB and must be a valid image file (JPG, JPEG, PNG or WebP).`,
      }
    ),
});

const updateGroupFormSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  groupImage: z
    .any()
    .nullable()
    .refine(
      (value) =>
        typeof value === "string"
          ? true
          : value?.length > 0 &&
            value?.[0]?.size <= MAX_FILE_SIZE &&
            ACCEPTED_IMAGE_TYPES.includes(value?.[0]?.type),
      {
        message: `Max image size is ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB and must be a valid image file (JPG, JPEG, PNG or WebP).`,
      }
    ),
  socials: z.array(
    z.object({
      type: z.string(),
      link: z
        .string()
        .url("Enter a valid URL (include https://)")
        .min(1, "Link is required"),
    })
  ),
});

// Infer the type
export type CreateGroupFormSchema = z.infer<typeof createGroupFormSchema>;
export type UpdateGroupFormSchema = z.infer<typeof updateGroupFormSchema>;

// Export the schema
export { createGroupFormSchema, updateGroupFormSchema };
