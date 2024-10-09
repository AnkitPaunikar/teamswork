import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";

// Function to generate a random ID
const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default function RetroDashboard() {
  const [retroBoard, setRetroBoard] = useState([]); // State to hold the retro boards

  // Function to handle adding a new retro board
  const handleAddRetroBoard = () => {
    const newBoard = {
      id: generateRandomId(),
      name: `Retro Board ${retroBoard.length + 1}`, // Name for the board
    };
    setRetroBoard((prev) => [...prev, newBoard]); // Update the state with the new board
  };

  return (
    <div className='flex flex-col items-start ml-10 mt-10'>
      <h2 className='text-2xl mb-4'>Create a Retro Board</h2>
      <div className='flex items-start space-x-6'>
        <Button
          onClick={handleAddRetroBoard} // Call function on button click
          variant='outline'
          className='bg-gray-500 text-white h-48 w-48 flex justify-center items-center'
        >
          <Plus size={32} />
        </Button>
        {/* Retro Board Link Boxes Display */}
        <div className='flex space-x-4'>
          {retroBoard.map((retro) => (
            <Link key={retro.id} href={`/retro/${retro.id}`} passHref>
              <div className='bg-white shadow-md h-48 w-48 flex flex-col justify-between rounded cursor-pointer transition-transform transform hover:scale-105 flex items-center justify-center text-center'>
                <h3 className='text-lg font-semibold'>{retro.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
