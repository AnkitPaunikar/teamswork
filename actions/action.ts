"use server";

import * as z from "zod";

import {
  AddUserInput,
  AddProjectInputType,
  CreatedProjectType,
  AddMemberInputType,
} from "@/schemas";

import { supabase } from "@/lib/supabaseClient";

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
const updateUserIfNeeded = async (
  existingUser: any,
  newValues: z.infer<typeof AddUserInput>
) => {
  const { username, email, image, role } = newValues;

  // Check if any user details have changed
  if (
    existingUser.username !== username ||
    existingUser.email !== email ||
    existingUser.image !== image ||
    existingUser.role !== role
  ) {
    try {
      const { error } = await supabase
        .from("users")
        .update({ username, email, image, role })
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
  const { error } = await supabase.from("members").insert(members);

  if (error) {
    console.error("Error adding members to project:", error);
    throw new Error("Failed to add members"); // or handle the error as needed
  }
};
