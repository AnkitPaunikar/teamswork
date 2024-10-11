"use client";

import { RoomProvider, useOthers, useMyPresence } from "@/liveblocks.config";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface StickyNoteType {
  id: number;
  content: string;
  color: string;
}

interface ColumnType {
  id: number;
  name: string;
  notes: StickyNoteType[];
}

interface CursorPresence {
  cursor?: {
    x: number;
    y: number;
  };
}

interface OtherUser {
  connectionId: string;
  presence: CursorPresence;
}

const RetroPage: React.FC = () => {
  const initialColumns = [
    { id: 1, name: "What went well", notes: [] },
    { id: 2, name: "What could be improved", notes: [] },
    { id: 3, name: "Action Items", notes: [] },
  ];

  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [draggingNote, setDraggingNote] = useState<StickyNoteType | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<ColumnType | null>(null);
  const [draggingColor, setDraggingColor] = useState<string>("");

  const handleMouseDown = (columnId: number, note: StickyNoteType) => {
    setDraggingNote(note);
    setDraggingColumn(columns.find((col) => col.notes.includes(note)) || null);
  };

  const handleDrop = (columnId: number) => {
    if (draggingNote && draggingColumn) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === columnId) {
            if (!column.notes.some((note) => note.id === draggingNote.id)) {
              return { ...column, notes: [...column.notes, draggingNote] };
            }
          } else if (column.id === draggingColumn.id) {
            return {
              ...column,
              notes: column.notes.filter((note) => note.id !== draggingNote.id),
            };
          }
          return column;
        })
      );
    } else if (draggingColor) {
      const newNote: StickyNoteType = {
        id: Date.now(),
        content: "New Note",
        color: draggingColor,
      };
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === columnId) {
            if (!column.notes.some((note) => note.id === newNote.id)) {
              return { ...column, notes: [...column.notes, newNote] };
            }
          }
          return column;
        })
      );
      setDraggingColor("");
    }
    setDraggingNote(null);
    setDraggingColumn(null);
  };

  const handleColorDragStart = (color: string) => {
    setDraggingColor(color);
  };

  const addNewColumn = () => {
    const newColumn: ColumnType = {
      id: Date.now(),
      name: "New Column",
      notes: [],
    };
    setColumns((prev) => [...prev, newColumn]);
  };

  const removeColumn = (columnId: number) => {
    setColumns(columns.filter((column) => column.id !== columnId));
  };

  const removeNote = (columnId: number, noteId: number) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            notes: column.notes.filter((note) => note.id !== noteId),
          };
        }
        return column;
      })
    );
  };

  const handleTextAreaChange = (
    columnId: number,
    noteId: number,
    content: string
  ) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              notes: col.notes.map((n) =>
                n.id === noteId ? { ...n, content } : n
              ),
            }
          : col
      )
    );
  };

  const [, updateMyPresence] = useMyPresence(); // Only need the update function

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateMyPresence]);

  const othersData = useOthers();
  const others: OtherUser[] = othersData.map((other) => ({
    connectionId: String(other.connectionId),
    presence: other.presence,
  }));

  return (
    <div className='flex h-screen m-4'>
      <div className='w-48 bg-gray-200 p-3 border-r border-gray-300 rounded'>
        <button
          onClick={addNewColumn}
          className='w-full bg-black text-white rounded-lg p-2'
        >
          Add Column
        </button>
        <h3 className='font-bold'>Pick & Drag Colors</h3>
        <div className='flex flex-col mb-5'>
          <div
            className='w-12 h-12 bg-emerald-300 border border-gray-300 mb-1 cursor-pointer rounded'
            draggable
            onDragStart={() => handleColorDragStart("#6ee7b7")}
          />
          <div
            className='w-12 h-12 bg-green-400 border border-gray-300 mb-1 cursor-pointer rounded'
            draggable
            onDragStart={() => handleColorDragStart("#4ade80")}
          />
          <div
            className='w-12 h-12 bg-yellow-400 border border-gray-300 mb-1 cursor-pointer rounded'
            draggable
            onDragStart={() => handleColorDragStart("#facc15")}
          />
          <div
            className='w-12 h-12 bg-orange-400 border border-gray-300 mb-1 cursor-pointer rounded'
            draggable
            onDragStart={() => handleColorDragStart("#fb923c")}
          />
          <div
            className='w-12 h-12 bg-red-400 border border-gray-300 mb-1 cursor-pointer rounded'
            draggable
            onDragStart={() => handleColorDragStart("#f87171")}
          />
        </div>
      </div>
      <div className='flex flex-grow bg-white p-4 space-x-4 overflow-auto'>
        {columns.map((column) => (
          <div
            key={column.id}
            className='flex-1 p-4 border-r border-gray-300 flex flex-col'
            onDrop={() => handleDrop(column.id)}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className='flex items-center justify-between mb-2'>
              <input
                type='text'
                className='border-none bg-transparent font-bold focus:outline-none'
                value={column.name}
                onChange={(e) => {
                  const updatedColumns = columns.map((col) =>
                    col.id === column.id
                      ? { ...col, name: e.target.value }
                      : col
                  );
                  setColumns(updatedColumns);
                }}
              />
              <button
                onClick={() => removeColumn(column.id)}
                className='text-red-500 text-2xl'
              >
                -
              </button>
            </div>
            <div className='flex flex-col space-y-2'>
              {column.notes.map((note) => (
                <div
                  key={note.id}
                  className='relative border border-gray-300 rounded p-2 mb-1'
                  style={{ backgroundColor: note.color }}
                  draggable
                  onMouseDown={() => handleMouseDown(column.id, note)}
                  onDragEnd={() => setDraggingNote(null)}
                >
                  <textarea
                    className='w-full h-auto border-none bg-transparent resize-none outline-none'
                    rows={1}
                    value={note.content}
                    onChange={(e) =>
                      handleTextAreaChange(column.id, note.id, e.target.value)
                    }
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  <button
                    onClick={() => removeNote(column.id, note.id)}
                    className='absolute top-0.5 right-1 text-red-600 font-bold text-sm'
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {others.map((other) => (
        <div
          key={other.connectionId}
          className='absolute flex items-center'
          style={{
            left: other.presence?.cursor?.x || 0,
            top: other.presence?.cursor?.y || 0,
          }}
        >
          <div className='h-5 w-5 bg-blue-400 rounded-full' />
          {/* <span className='ml-1 text-sm'>
            {usernames[other.connectionId] || "Anonymous"}
          </span> */}
        </div>
      ))}
    </div>
  );
};

const RetroPageWrapper: React.FC = () => {
  const { id } = useParams(); // Assuming you are using `useParams` from `next/navigation`

  return (
    //<RoomProvider id={`project-room-${id}`}>
    <RetroPage />
    //</RoomProvider>
  );
};

export default RetroPageWrapper;
