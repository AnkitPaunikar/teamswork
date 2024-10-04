import * as z from "zod";

export const AddUserInput = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  image: z.string().min(1).nullable(),
  created_at: z.date(),
  role: z.string(),
});

export const AddProjectInput = z.object({
  id: z.string().optional(), // Add optional id here if you want it in the input
  name: z.string().min(1),
  description: z.string().optional(),
  owner_id: z.string().min(1),
  created_at: z.date(),
});

// Type for a created project returned from the database
export const CreatedProject = z.object({
  id: z.string(), // Assuming this is a UUID
  created_at: z.date(),
  name: z.string(),
  owner_id: z.string(),
  description: z.string().optional(),
});

export const AddMemberInput = z.object({
  project_id: z.string().min(1),
  user_id: z.string().min(1),
  added_at: z.date(),
});

export type AddUserInputType = z.infer<typeof AddUserInput>;
export type AddProjectInputType = z.infer<typeof AddProjectInput>;
export type CreatedProjectType = z.infer<typeof CreatedProject>;
export type AddMemberInputType = z.infer<typeof AddMemberInput>;
