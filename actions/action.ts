"use server";

import * as z from "zod";

import {
  AddUserInput,
  AddProjectInputType,
  CreatedProjectType,
  AddMemberInputType,
  ProjectType,
  AddMemberInput,
} from "@/schemas";

import { supabase } from "@/lib/supabaseClient";

export const getAllUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data;
};

// Fetch a user by their ID
export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
};

// Add a user if they don't exist or update their details if they do
export const addUserIfNotExists = async (
  values: z.infer<typeof AddUserInput>
) => {
  const { id } = values;
  const existingUser = await getUserById(id);

  // If the user does not exist, create a new user
  if (!existingUser) {
    const newUser = await addUserSupabase(values);
    return newUser;
  }

  // If the user exists, check for updates
  const updatedUser = await updateUserIfNeeded(existingUser, values);
  return updatedUser;
};

// Add a new user to the database
export const addUserSupabase = async (values: z.infer<typeof AddUserInput>) => {
  try {
    const {
      id,
      username,
      email,
      created_at = new Date(),
      image,
      role,
    } = values;
    const { data: user, error } = await supabase
      .from("users")
      .insert([{ id, username, email, created_at, image, role }]);

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
};

// Update user details if they have changed
export const updateUserIfNeeded = async (
  existingUser: any,
  newValues: z.infer<typeof AddUserInput>
) => {
  const { id, username, email, image, role, org_id, project_id } = newValues;

  // Check if any user details have changed
  if (
    existingUser.username !== username ||
    existingUser.id !== id ||
    existingUser.email !== email ||
    existingUser.image !== image ||
    existingUser.role !== role ||
    existingUser.org_id !== org_id ||
    existingUser.project_id !== project_id
  ) {
    try {
      const { error } = await supabase
        .from("users")
        .update({ id, username, email, image, role, org_id, project_id })
        .eq("id", existingUser.id);

      if (error) {
        throw error;
      }
      const updatedUser = await getUserById(existingUser.id);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  return existingUser;
};

export const createProject = async (
  projectDetails: AddProjectInputType
): Promise<CreatedProjectType | null> => {
  const { data, error } = await supabase
    .from("projects")
    .insert([projectDetails])
    .select(); // Assuming you want to return the inserted project

  if (error) {
    console.error("Error creating project:", error);
    return null; // or throw an error
  }

  return data?.[0] || null; // Return the first created project object
};

export const addMembersToProject = async (
  members: AddMemberInputType[]
): Promise<void> => {
  const { error } = await supabase.from("members").upsert(members);

  if (error) {
    console.error("Error adding members to project:", error);
  }
};

export const fetchProjects = async (userId: string): Promise<ProjectType[]> => {
  const user = await getUserById(userId);

  if (
    !user ||
    !Array.isArray(user.project_id) ||
    user.project_id.length === 0
  ) {
    console.error("No projects found for this user.");
    return [];
  }

  const projectIds = user.project_id;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data;
};

export const updateUserProjects = async (
  userId: string,
  newProjectId: string
) => {
  try {
    // Fetch the current user's project_id field
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("project_id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }

    // Check if the project_id is null, if so, initialize it as an empty array
    const currentProjects = existingUser?.project_id ?? [];

    // If currentProjects is not an array (null case), convert it to an empty array
    const updatedProjects = Array.isArray(currentProjects)
      ? [...currentProjects, newProjectId] // Append the new project ID if it's an array
      : [newProjectId]; // If not an array, create a new array with the new project ID

    // Update the user's project_id field with the updated array
    const { error: updateError } = await supabase
      .from("users")
      .update({ project_id: updatedProjects })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user project_id:", updateError);
      return null;
    }

    // Fetch and return the updated user
    const updatedUser = await getUserById(userId);
    return updatedUser;
  } catch (error) {
    console.error("Error updating user with new project ID:", error);
    return null;
  }
};

export const fetchMembers = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("project_id", id); // Filter by project_id

    if (error) {
      throw error; // Throw error if any
    }

    // Validate and set members data
    const validatedMembers = data.map((member) => member);
    return validatedMembers;
  } catch (error) {
    console.error(error);
  }
};
