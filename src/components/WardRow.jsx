import React from "react";
import PersonItem from "./PersonItem";

// WardRow component for displaying ward information with compact design
const WardRow = ({
  ward,
  onEditWard,
  onDeleteWard,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  parentId, // Add parentId prop
  colors = {
    background: "bg-blue-50",
    border: "border-blue-200",
    buttonHover: "hover:bg-blue-100",
    buttonBorder: "border-blue-300",
    buttonText: "text-gray-700",
  },
}) => {
  const handleDeleteWard = () => {
    if (
      window.confirm(`আপনি কি নিশ্চিত যে "${ward.name}" ওয়ার্ড মুছে দিতে চান?`)
    ) {
      onDeleteWard(ward.id);
    }
  };

  // Create person colors based on region colors
  const personColors = {
    background:
      colors.background === "bg-green-50"
        ? "bg-green-100"
        : colors.background === "bg-blue-50"
        ? "bg-blue-100"
        : colors.background === "bg-orange-50"
        ? "bg-orange-100"
        : "bg-gray-100",
    border: colors.border,
    hover:
      colors.background === "bg-green-50"
        ? "hover:bg-green-200"
        : colors.background === "bg-blue-50"
        ? "hover:bg-blue-200"
        : colors.background === "bg-orange-50"
        ? "hover:bg-orange-200"
        : "hover:bg-gray-200",
  };

  return (
    <div
      className={`${colors.border} border rounded-md p-2 ${colors.background} shadow-sm`}
    >
      {/* Ward Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{ward.name}</h4>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditWard(ward, parentId)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
            title="ওয়ার্ড সম্পাদনা করুন"
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
            onClick={handleDeleteWard}
            className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
            title="ওয়ার্ড মুছে দিন"
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

      {/* Ward Persons */}
      <div className="space-y-1 mb-2">
        {ward.persons &&
          ward.persons.map((person) => (
            <PersonItem
              key={person.id}
              person={person}
              onEdit={(person) => onEditPerson(person, parentId, ward.id)}
              onDelete={(personId) => onDeletePerson(ward.id, personId)}
              compact={true}
              colors={personColors}
            />
          ))}
      </div>

      {/* Add Person Button */}
      <button
        onClick={() => onAddPerson(ward.id)}
        className={`w-full py-1 px-2 text-xs ${colors.buttonText} border ${colors.buttonBorder} rounded ${colors.buttonHover} transition-colors`}
      >
        + ওয়ার্ড দায়িত্বশীল যোগ করুন
      </button>
    </div>
  );
};

export default WardRow;
