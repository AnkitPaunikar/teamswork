"use client";
import React, { forwardRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AddMember from "@/components/AddMember";
import Sidebar from "@/components/SideBar";
import RetroDashboard from "@/components/RetroDashboard";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Draggable Dropdown Component
const DraggableDropdown = forwardRef<HTMLDivElement>((props, ref) => {
  const [{ isDragging }, drag] = useDrag({
    type: "dropdown", // This should be "dropdown"
    item: { type: "dropdown" }, // Ensure the item type is set here
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(node);
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }
      }}
      className={`p-2 mt-2 border border-dashed border-blue-500 rounded-md text-center ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      Drag me (Dropdown)
    </div>
  );
});

DraggableDropdown.displayName = "DraggableDropdown";

// Draggable Table Component
const DraggableTable = () => {
  const [{ isDragging }, drag] = useDrag({
    type: "table",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={`p-4 border border-dashed border-gray-500 rounded-md text-center ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      Drag me to create a table
    </div>
  );
};

// DropZone for dropping the entire table
interface DropZoneProps {
  addTable: (table: TableProps) => void;
  tables: TableProps[];
}

const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  ({ addTable, tables }, ref) => {
    const [{ isOver }, drop] = useDrop({
      accept: "table",
      drop: () => {
        addTable({
          headers: ["Header 1", "Header 2", "Header 3"],
          rows: [["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"]],
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    const combinedRef = (node: HTMLDivElement | null) => {
      drop(node);
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }
    };

    return (
      <div
        ref={combinedRef}
        className={`w-full border border-gray-400 border-dashed rounded-lg flex flex-col items-center justify-start transition-all duration-200 ${
          isOver ? "bg-gray-200" : "bg-white"
        }`}
        style={{ minHeight: "200px", maxHeight: "500px", overflowY: "auto" }}
      >
        <span className='text-sm text-gray-500'>Drop the table here</span>
        <div className='mt-4 w-full'>
          {tables.map((table, index) => (
            <EditableTable key={index} {...table} />
          ))}
        </div>
      </div>
    );
  }
);

DropZone.displayName = "DropZone";

// Editable Table Component
interface TableProps {
  headers: string[];
  rows: string[][];
}

// Editable Table Component
const EditableTable = ({ headers, rows }: TableProps) => {
  const [tableHeaders, setTableHeaders] = useState(headers);
  const [tableRows, setTableRows] = useState(rows);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...tableHeaders];
    newHeaders[index] = value;
    setTableHeaders(newHeaders);
  };

  const addColumn = () => {
    setTableHeaders([...tableHeaders, `Header ${tableHeaders.length + 1}`]);
    setTableRows(tableRows.map((row) => [...row, ""]));
  };

  // Function to handle adding new rows
  const addRow = () => {
    const newRow = Array(tableHeaders.length).fill("");
    setTableRows((prev) => [...prev, newRow]);
  };

  const handleDrop = (rowIndex: number, colIndex: number, type: string) => {
    // Placeholder for handling drop (if needed)
    console.log(`Dropped a ${type} at row ${rowIndex}, col ${colIndex}`);
  };

  return (
    <div className='mb-4'>
      <div className='flex items-center justify-between mb-2'>
        <input
          type='text'
          value='Editable Table'
          className='text-lg font-bold border-b border-gray-300'
          onChange={() => {}}
        />
        <div>
          <button className='ml-2 text-sm text-blue-500' onClick={addColumn}>
            + Add Column
          </button>
          <button className='ml-2 text-sm text-green-500' onClick={addRow}>
            + Add Row
          </button>
        </div>
      </div>
      <table className='w-full table-fixed border-collapse border border-gray-300'>
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={index} className='border p-2'>
                <input
                  type='text'
                  value={header}
                  className='w-full text-center border-b border-gray-300'
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className='border p-2'>
                  <DropZoneCell
                    onDrop={(type) => handleDrop(rowIndex, colIndex, type)} // Pass type to handleDrop
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DropZoneCell = ({ onDrop }: { onDrop: (type: string) => void }) => {
  const [dropdownValue, setDropdownValue] = useState<string>("Select");
  const [options, setOptions] = useState<string[]>([]);
  const [isDropdownDropped, setIsDropdownDropped] = useState<boolean>(false);
  const [newOption, setNewOption] = useState<string>("");
  const [isTextFieldDropped, setIsTextFieldDropped] = useState<boolean>(false);

  const [{ isOver }, drop] = useDrop({
    accept: ["dropdown", "textField"],
    drop: (item: { type: string }) => {
      if (item.type === "dropdown") {
        setIsDropdownDropped(true);
        onDrop("dropdown");
      } else if (item.type === "textField") {
        setIsTextFieldDropped(true);
        onDrop("textField");
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDropdownValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && newOption.trim()) {
      if (!options.includes(newOption.trim())) {
        setOptions((prev) => [...prev, newOption.trim()]);
        setNewOption("");
      }
    }
  };

  return (
    <div
      ref={dropRef}
      className={`h-10 w-full ${isOver ? "bg-gray-200" : ""} transition-all`}
    >
      {isDropdownDropped ? (
        <>
          <input
            type='text'
            placeholder='Type an option and press Enter'
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-full border-b border-gray-300 mb-1'
          />
          <select
            value={dropdownValue}
            onChange={handleDropdownChange}
            className='w-full'
          >
            {options.length === 0 ? (
              <option value='' disabled>
                No options available
              </option>
            ) : (
              options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))
            )}
          </select>
        </>
      ) : isTextFieldDropped ? (
        <input
          type='text'
          placeholder='Enter text here'
          className='w-full border-b border-gray-300 mb-1'
        />
      ) : (
        <span className='text-gray-500'>Drop Dropdown or Text Field Here</span>
      )}
    </div>
  );
};

// DraggableTextField Component
const DraggableTextField = forwardRef<HTMLDivElement>((props, ref) => {
  const [{ isDragging }, drag] = useDrag({
    type: "textField", // This should be "textField"
    item: { type: "textField" }, // Ensure the item type is set here
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(node);
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }
      }}
      className={`p-2 mt-2 border border-dashed border-green-500 rounded-md text-center ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      Drag me (Text Field)
    </div>
  );
});

DraggableTextField.displayName = "DraggableTextField";

// ProjectContent Component
const ProjectContent = ({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [tables, setTables] = useState<TableProps[]>([]);

  const handleSelect = (selectedContent: string) => {
    setContent(selectedContent);
  };

  const addTable = (table: TableProps) => {
    setTables((prev) => [...prev, table]);
  };

  const renderContent = () => {
    switch (content) {
      case "primaryDetails":
        return (
          <div className='p-4'>
            <DropZone addTable={addTable} tables={tables} />
          </div>
        );
      case "retro":
        return (
          <div className='p-4'>
            <RetroDashboard />
          </div>
        );
      default:
        return <div className='p-4'>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className='relative h-screen'>
      <Sidebar onSelect={handleSelect} />
      <div
        className={`grid ${
          content === "retro" ? "grid-cols-1" : "grid-cols-12"
        } gap-3 p-4`}
      >
        <div
          className={`col-span-12 ${
            content === "retro" ? "" : "md:col-span-9"
          }`}
        >
          <div className='p-4 border border-gray-300 rounded-lg h-full'>
            {renderContent()}
          </div>
        </div>

        {content !== "retro" && (
          <div className='col-span-12 md:col-span-3 mt-4'>
            <AddMember />
            <DraggableTable />
            <DraggableDropdown />
            <DraggableTextField />
          </div>
        )}
      </div>
    </div>
  );
};

// Main Projectpage Component
const Projectpage = () => {
  const [content, setContent] = useState("primaryDetails");
  const { id } = useParams();
  const { user } = useUser();

  if (!user || !id) return <div>Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectContent content={content} setContent={setContent} />
    </DndProvider>
  );
};

export default Projectpage;
