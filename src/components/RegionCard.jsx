import React from "react";
import UnionRow from "./UnionRow";
import WardRow from "./WardRow";

// RegionCard component for displaying entire region with compact design
const RegionCard = ({ region, onRegionActions }) => {
  const {
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
  } = onRegionActions;

  // Define colors for each region
  const getRegionColors = (regionId) => {
    switch (regionId) {
      case "region-lohagora":
        return {
          background: "bg-green-50",
          border: "border-green-200",
          divider: "bg-green-200",
          buttonHover: "hover:bg-green-100",
          buttonBorder: "border-green-300",
          buttonText: "text-gray-700",
        };
      case "region-satkania":
        return {
          background: "bg-blue-50",
          border: "border-blue-200",
          divider: "bg-blue-200",
          buttonHover: "hover:bg-blue-100",
          buttonBorder: "border-blue-300",
          buttonText: "text-gray-700",
        };
      case "region-satkania-pouroshova":
        return {
          background: "bg-orange-50",
          border: "border-orange-200",
          divider: "bg-orange-200",
          buttonHover: "hover:bg-orange-100",
          buttonBorder: "border-orange-300",
          buttonText: "text-gray-700",
        };
      default:
        return {
          background: "bg-gray-50",
          border: "border-gray-200",
          divider: "bg-gray-200",
          buttonHover: "hover:bg-gray-100",
          buttonBorder: "border-gray-300",
          buttonText: "text-gray-700",
        };
    }
  };

  const colors = getRegionColors(region.id);

  return (
    <div
      className={`${colors.background} ${colors.border} rounded-lg shadow-sm p-4`}
    >
      {/* Region Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{region.name}</h2>
        <div className={`h-px ${colors.divider}`}></div>
      </div>

      {/* Region Content */}
      <div className="space-y-3">
        {region.hasUnions ? (
          // Region with unions
          <>
            {region.unions && region.unions.length > 0 ? (
              region.unions.map((union) => (
                <UnionRow
                  key={union.id}
                  union={union}
                  onEditUnion={onEditUnion}
                  onAddWard={onAddWard}
                  onEditWard={onEditWard}
                  onDeleteWard={onDeleteWard}
                  onAddUnionPerson={onAddUnionPerson}
                  onEditUnionPerson={onEditUnionPerson}
                  onDeleteUnionPerson={onDeleteUnionPerson}
                  onAddWardPerson={onAddWardPerson}
                  onEditWardPerson={onEditWardPerson}
                  onDeleteWardPerson={onDeleteWardPerson}
                  colors={colors}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                কোন ইউনিয়ন নেই
              </p>
            )}
          </>
        ) : (
          // Pouroshova - direct wards
          <>
            <div className="mb-2">
              <button
                onClick={() => onAddWard(region.id)}
                className={`w-full py-2 px-3 text-sm ${colors.buttonText} ${colors.buttonBorder} border rounded ${colors.buttonHover} transition-colors`}
              >
                + নতুন ওয়ার্ড যোগ করুন
              </button>
            </div>

            {region.wards && region.wards.length > 0 ? (
              <div className="space-y-2">
                {region.wards.map((ward) => (
                  <WardRow
                    key={ward.id}
                    ward={ward}
                    onEditWard={onEditWard}
                    onDeleteWard={(wardId) => onDeleteWard(region.id, wardId)}
                    onAddPerson={(wardId) => onAddWardPerson(region.id, wardId)}
                    onEditPerson={onEditWardPerson}
                    onDeletePerson={(wardId, personId) =>
                      onDeleteWardPerson(region.id, wardId, personId)
                    }
                    parentId={region.id}
                    colors={colors}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                কোন ওয়ার্ড নেই
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegionCard;
