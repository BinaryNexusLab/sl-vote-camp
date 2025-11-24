import React from "react";
import WardRow from "./WardRow";

// UnionRow component for displaying union information with compact design
const UnionRow = ({
  union,
  onEditUnion,
  onAddWard,
  onEditWard,
  onDeleteWard,
  onAddUnionPerson,
  onEditUnionPerson,
  onDeleteUnionPerson,
  onAddWardPerson,
  onEditWardPerson,
  onDeleteWardPerson,
  colors = {
    background: "bg-blue-50",
    border: "border-blue-200",
    buttonHover: "hover:bg-blue-100",
    buttonBorder: "border-blue-300",
    buttonText: "text-gray-700",
  },
}) => {
  return (
    <div
      className={`${colors.border} border rounded-md p-3 ${colors.background} shadow-sm`}
    >
      {/* Union Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-gray-900">
              {union.name}
            </h3>
            <button
              onClick={() => onEditUnion(union)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
              title="ইউনিয়ন নাম সম্পাদনা করুন"
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
          </div>
        </div>
      </div>

      {/* Union Responsible Persons */}
      {union.unionResponsible && union.unionResponsible.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            ইউনিয়ন দায়িত্বশীল:
          </h4>
          <div className="space-y-1">
            {union.unionResponsible.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between py-1 px-2 bg-blue-50 border border-blue-200 rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {person.name}
                  </p>
                  {person.phone && (
                    <p className="text-xs text-blue-700 truncate">
                      {person.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => onEditUnionPerson(person, union.id)}
                    className="p-1 text-blue-500 hover:text-blue-700 rounded transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <svg
                      className="w-3 h-3"
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
                    onClick={() => {
                      if (
                        window.confirm(
                          `আপনি কি নিশ্চিত যে "${person.name}" কে ইউনিয়ন দায়িত্বশীল থেকে মুছে দিতে চান?`
                        )
                      ) {
                        onDeleteUnionPerson(union.id, person.id);
                      }
                    }}
                    className="p-1 text-blue-500 hover:text-red-600 rounded transition-colors"
                    title="মুছে দিন"
                  >
                    <svg
                      className="w-3 h-3"
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
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => onAddWard(union.id)}
          className={`flex-1 py-1 px-2 text-xs ${colors.buttonText} border ${colors.buttonBorder} rounded ${colors.buttonHover} transition-colors`}
        >
          + ওয়ার্ড যোগ করুন
        </button>

        {union.unionResponsible.length < 2 && (
          <button
            onClick={() => onAddUnionPerson(union.id)}
            className="flex-1 py-1 px-2 text-xs text-blue-700 border border-blue-400 rounded hover:bg-blue-200 transition-colors"
          >
            + ইউনিয়ন দায়িত্বশীল
          </button>
        )}
      </div>

      {/* Wards */}
      {union.wards && union.wards.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">ওয়ার্ডসমূহ:</h4>
          {union.wards.map((ward) => (
            <WardRow
              key={ward.id}
              ward={ward}
              onEditWard={onEditWard}
              onDeleteWard={(wardId) => onDeleteWard(union.id, wardId)}
              onAddPerson={(wardId) => onAddWardPerson(union.id, wardId)}
              onEditPerson={onEditWardPerson}
              onDeletePerson={(wardId, personId) =>
                onDeleteWardPerson(union.id, wardId, personId)
              }
              parentId={union.id}
              colors={colors}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnionRow;
