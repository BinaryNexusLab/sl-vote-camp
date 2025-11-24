import React from "react";

// PersonItem component for displaying individual person with edit/delete actions
const PersonItem = ({
  person,
  onEdit,
  onDelete,
  compact = false,
  colors = {
    background: "bg-blue-100",
    border: "border-blue-200",
    hover: "hover:bg-blue-200",
  },
}) => {
  const handleEdit = () => {
    onEdit(person);
  };

  const handleDelete = () => {
    if (
      window.confirm(`আপনি কি নিশ্চিত যে "${person.name}" কে মুছে দিতে চান?`)
    ) {
      onDelete(person.id);
    }
  };

  return (
    <div
      className={`flex items-center justify-between ${
        compact ? "py-1" : "py-2"
      } px-2 border ${colors.border} rounded ${colors.background} ${
        colors.hover
      } transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`${
            compact ? "text-xs" : "text-sm"
          } font-medium text-gray-900 truncate`}
        >
          {person.name}
        </p>
        {person.phone && (
          <p
            className={`${
              compact ? "text-xs" : "text-sm"
            } text-gray-600 truncate`}
          >
            {person.phone}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1 ml-2">
        <button
          onClick={handleEdit}
          className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
          title="সম্পাদনা করুন"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
          title="মুছে দিন"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PersonItem;
