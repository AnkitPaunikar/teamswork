"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { OrganizationMembershipResource } from "@clerk/types";

import {
  addMembersToProject,
  fetchMembers,
  getUserById,
  updateUserIfNeeded,
} from "@/actions/action";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";

type MembersWithDetails = {
  user_id: number | string;
  added_by: string;
  added_at: string;
  username: string;
  added_by_username: string;
  image: string | null; // Optional
};

function AddMember() {
  const { id } = useParams();
  const { user } = useUser();
  const { organization } = useOrganization();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<
    OrganizationMembershipResource[]
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MembersWithDetails[]>([]);

  useEffect(() => {
    if (organization) {
      fetchUsers();
    }
  }, [organization]);

  const fetchData = async () => {
    if (id) {
      const projectMembers = await fetchMembers(id as string);
      console.log("projectMembers", projectMembers);

      if (projectMembers && projectMembers.length > 0) {
        const userPromises = projectMembers.map((member) =>
          getUserById(member.user_id)
        );

        const users = await Promise.all(userPromises);
        console.log("Users", users);

        const addedByUserIds = Array.from(
          new Set(projectMembers.map((member) => member.added_by))
        );
        const addedByUserPromises = addedByUserIds.map((id) => getUserById(id));
        const addedByUsers = await Promise.all(addedByUserPromises);

        const addedByUserMap = addedByUsers.reduce((acc, user) => {
          if (user) acc[user.id] = user.username;
          return acc;
        }, {} as Record<string, string>);

        const membersWithDetails = projectMembers.map((member, index) => ({
          added_by: member.added_by,
          added_at: member.added_at,
          user_id: member.user_id,
          added_by_username: addedByUserMap[member.added_by],
          username: users[index]?.username,
          image: users[index]?.image || null,
        }));

        setMembers(membersWithDetails);
      } else {
        console.log("No project members found.");
        setMembers([]);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(members);

  const fetchUsers = async () => {
    try {
      if (organization) {
        const response = await organization.getMemberships();

        const usersWithoutCurrentUser = response.data.filter(
          (member) => member.publicUserData.userId !== user?.id
        );

        setFilteredUsers(usersWithoutCurrentUser);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle adding a member to the project
  const addMemberToProject = async (userId: string) => {
    const added_at = new Date().toISOString();
    const added_by = user?.id as string;
    try {
      if (!id) {
        console.error("Project ID is not available in the URL.");
        return;
      }

      // Prepare the member data to be added
      const memberData = {
        user_id: userId as string, // Use publicUserData.userId of the added user
        project_id: id as string,
        org_id: organization?.id as string, // Set org_id to the current organization ID
        added_at,
        added_by,
      };

      await addMembersToProject([memberData]);

      // Fetch the existing user details
      const existingUser = await getUserById(userId);

      // Get the current and new values for org_id and project_id
      const currentOrgId = existingUser.org_id; // Can be null
      const newOrgId = organization?.id; // New org_id
      const currentProject = existingUser.project_id; // Can be null
      const newProject = id; // New project_id

      // Check if either org_id or project_id has changed, considering null values
      const shouldUpdateOrgOrProject =
        (currentOrgId === null && newOrgId !== null) ||
        currentOrgId !== newOrgId ||
        (currentProject === null && newProject !== null) ||
        currentProject !== newProject;

      let updatedUser;

      if (shouldUpdateOrgOrProject) {
        // Fetch the current user's project_id
        const existingProjectIds = existingUser?.project_id ?? [];

        // Ensure the new project ID is appended, checking if it already exists
        const updatedProjectIds = Array.isArray(existingProjectIds)
          ? existingProjectIds.includes(newProject)
            ? existingProjectIds
            : [...existingProjectIds, newProject]
          : [newProject];

        // Call the update function, making sure the org_id and project_id are updated properly
        updatedUser = await updateUserIfNeeded(existingUser, {
          ...existingUser,
          org_id: newOrgId,
          project_id: updatedProjectIds,
        });
      } else {
        console.error("No updates required for the user.");
      }

      // Check if user update was successful
      if (!updatedUser && shouldUpdateOrgOrProject) {
        console.error(
          "Failed to update the user organization ID or project ID."
        );
      }

      // Update the state to reflect the added user in the UI
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
      fetchData();
    } catch (error) {
      console.error("Error adding member to project:", error);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      fetchUsers(); // Reset to all users
    } else {
      const filtered = filteredUsers.filter(
        (user) =>
          (user.publicUserData.firstName?.trim().toLowerCase() || "").includes(
            value.toLowerCase()
          ) ||
          (user.publicUserData.lastName?.trim().toLowerCase() || "").includes(
            value.toLowerCase()
          )
      );

      setFilteredUsers(filtered);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <div className='flex items-center mb-4'>
          <h1 className='text-lg font-semibold mr-2'>Add Member</h1>

          {/* Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='default'
                className='flex items-center px-1 py-1 rounded-lg h-7'
              >
                <Plus />
              </Button>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent>
              <div className='flex justify-between items-center'>
                <DialogTitle>Add Member to Project</DialogTitle>
                {/* Close Button using DialogClose */}
                <DialogClose className='ml-4'></DialogClose>
              </div>

              <div className='mt-4'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder='Search users...'
                  className='w-full border border-gray-300 p-2 rounded-lg'
                />

                {/* Display filtered users */}
                <div className='mt-4'>
                  {filteredUsers.length > 0 ? (
                    <ul>
                      {filteredUsers.map((user) => (
                        <li
                          key={user.id}
                          className='flex justify-between items-center py-2 border-b'
                        >
                          <span>
                            {user.publicUserData.firstName}{" "}
                            {user.publicUserData.lastName}
                          </span>
                          <button
                            className='text-sm text-blue-500'
                            onClick={() =>
                              addMemberToProject(
                                user.publicUserData.userId as string
                              )
                            }
                            disabled={
                              selectedUsers.includes(
                                user.publicUserData.userId as string
                              ) ||
                              members.some(
                                (member) =>
                                  member.user_id === user.publicUserData.userId
                              )
                            }
                          >
                            {selectedUsers.includes(
                              user.publicUserData.userId as string
                            ) ||
                            members.some(
                              (member) =>
                                member.user_id === user.publicUserData.userId
                            )
                              ? "Added"
                              : "Add"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No users found.</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className='p-4'>
        <h1 className='text-xl font-bold mb-4'>Members List</h1>
        <table className='w-1/3 border-collapse border border-gray-300'>
          <thead>
            <tr className='border-b border-gray-300'>
              <th className='p-2 text-left'></th>
              <th className='p-2 text-left'>Member</th>
              <th className='p-2 text-left'>Added by</th>
              <th className='p-2 text-left'>Time</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={index} className='border-b border-gray-300'>
                <td className='flex items-center p-2'>
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.username}
                      width={32}
                      height={32}
                      className='w-8 h-8 rounded-full mr-2'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-gray-300 mr-2' />
                  )}
                </td>
                <td className='p-2'>{member.username}</td>
                <td className='p-2'>{member.added_by_username}</td>
                <td className='p-2'>
                  {new Date(member.added_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AddMember;
