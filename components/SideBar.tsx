import React, { useEffect, useState, useCallback } from "react";
import { InfoCircledIcon, BookmarkIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";

type SidebarProps = {
  onSelect: (screen: "primaryDetails" | "retro") => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const [position, setPosition] = useState({ top: 60, left: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartPosition({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          left: e.clientX - dragStartPosition.x,
          top: e.clientY - dragStartPosition.y,
        });
      }
    },
    [isDragging, dragStartPosition]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <Tooltip.Provider>
      <div
        className='flex flex-col bg-gray-100 border border-gray-300 rounded-lg p-1'
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        <h2 className='font-semibold mb-2'>Screens</h2>
        <div className='flex justify-center items-center flex-col space-y-1'>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className='flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded transition'
                onClick={() => onSelect("primaryDetails")}
              >
                <InfoCircledIcon className='text-gray-600' />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className='bg-gray-700 text-white text-xs rounded py-1 px-2'>
                View primary details
                <Tooltip.Arrow className='fill-gray-700' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className='flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded transition'
                onClick={() => onSelect("retro")}
              >
                <BookmarkIcon className='text-gray-600' />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className='bg-gray-700 text-white text-xs rounded py-1 px-2'>
                View retro items
                <Tooltip.Arrow className='fill-gray-700' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default Sidebar;
