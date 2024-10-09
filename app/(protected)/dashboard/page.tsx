"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ProjectType } from "@/schemas";

import {
  addUserIfNotExists,
  createProject,
  fetchProjects,
  updateUserProjects,
} from "@/actions/action";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Example() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { membership } = useOrganization();

  const [openDialog, setOpenDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      addUserIfNotExists({
        id: user.id,
        username: user.fullName as string,
        email: user?.primaryEmailAddress?.emailAddress as string,
        image: user.imageUrl || null,
        role: membership?.role as string,
        created_at: new Date(),
      });
    }
  }, [isLoaded, isSignedIn, user, membership?.role]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) {
        console.error("User ID is not available. Skipping project fetch.");
        return;
      }

      const projectData = await fetchProjects(user.id);
      setProjects(projectData);
    };

    loadProjects();
  }, [user?.id]);

  const handleAddProject = async () => {
    if (!projectName || !projectDescription) return;

    const projectDetails = {
      name: projectName as string,
      description: projectDescription as string,
      owner_id: user?.id as string,
      created_at: new Date(),
    };

    const createdProject = await createProject(projectDetails);

    if (createdProject) {
      // Update the user with the newly created project ID
      const updatedUser = await updateUserProjects(
        user?.id as string,
        createdProject.id
      );
      if (!updatedUser) {
        console.error("Failed to update user with new project ID");
        return;
      }

      const projectData = await fetchProjects(user?.id as string);

      setProjects(projectData as []);
      setOpenDialog(false);
      setProjectName("");
      setProjectDescription("");
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className='flex flex-col items-start ml-10 mt-10'>
      <div className='text-xl mb-4'>Hello, {user?.fullName || "Edamone"}</div>

      <h2 className='text-2xl mb-4'>Create a Project</h2>
      <div className='flex items-start space-x-6'>
        <Button
          onClick={() => setOpenDialog(true)}
          variant='outline'
          className='bg-gray-500 text-white h-48 w-48 flex justify-center items-center' // Ensure height and width are equal
        >
          <Plus size={32} />
        </Button>
        {/* Project Cards Display */}
        <div className='flex space-x-4'>
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} passHref>
              <div className='bg-white shadow-md h-48 w-48 flex flex-col justify-between rounded cursor-pointer transition-transform transform hover:scale-105'>
                <div className='flex flex-col flex-grow'>
                  <h3 className='text-lg font-semibold bg-black text-white p-2 rounded-t'>
                    {project?.name}
                  </h3>
                  <p className='text-md p-2 flex-grow'>
                    {project?.description}
                  </p>
                </div>

                <div className='flex justify-start items-center p-2 border-t'>
                  <div className='flex -space-x-2 overflow-hidden'></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dialog for adding project details */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-md p-6'>
          <DialogTitle className='text-xl mb-4'>Add Project</DialogTitle>
          <Input
            placeholder='Project Name'
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className='mb-4 p-2 border border-gray-300 rounded'
          />
          <Input
            placeholder='Project Description'
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className='mb-4 p-2 border border-gray-300 rounded'
          />
          {/* Buttons inside the Dialog */}
          <div className='flex justify-end space-x-4 mt-4'>
            <Button
              onClick={() => setOpenDialog(false)}
              variant='secondary'
              className='bg-gray-400 text-white'
            >
              Cancel
            </Button>
            <Button onClick={handleAddProject} variant='default'>
              Add Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
