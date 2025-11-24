import React, { useState, useEffect } from "react";

// FilterBar component for filtering by Region, Union, and Ward
const FilterBar = ({ regions, onFilterChange, activeFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    region: "",
    union: "",
    ward: "",
  });

  // Get available unions based on selected region
  const getAvailableUnions = () => {
    if (!localFilters.region) return [];

    const selectedRegion = regions.find((r) => r.id === localFilters.region);
    if (!selectedRegion || !selectedRegion.hasUnions) return [];

    return selectedRegion.unions || [];
  };

  // Get available wards based on selected region and union
  const getAvailableWards = () => {
    if (!localFilters.region) return [];

    const selectedRegion = regions.find((r) => r.id === localFilters.region);
    if (!selectedRegion) return [];

    // For pouroshova (no unions), return direct wards
    if (!selectedRegion.hasUnions) {
      return selectedRegion.wards || [];
    }

    // For regions with unions
    if (!localFilters.union) {
      // Return all wards from all unions
      const allWards = [];
      selectedRegion.unions?.forEach((union) => {
        union.wards?.forEach((ward) => {
          allWards.push({
            ...ward,
            unionName: union.name, // Add union name for context
          });
        });
      });
      return allWards;
    }

    // Return wards from selected union
    const selectedUnion = selectedRegion.unions?.find(
      (u) => u.id === localFilters.union
    );
    return selectedUnion?.wards || [];
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    let newFilters = { ...localFilters };

    if (filterType === "region") {
      newFilters = { region: value, union: "", ward: "" };
    } else if (filterType === "union") {
      newFilters = { ...localFilters, union: value, ward: "" };
    } else if (filterType === "ward") {
      newFilters = { ...localFilters, ward: value };
    }

    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = { region: "", union: "", ward: "" };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Get filter stats
  const getFilterStats = () => {
    const selectedRegion = regions.find((r) => r.id === localFilters.region);
    if (!selectedRegion) return null;

    let totalUnions = 0;
    let totalWards = 0;
    let totalPersons = 0;

    if (selectedRegion.hasUnions) {
      const unionsToCount = localFilters.union
        ? selectedRegion.unions?.filter((u) => u.id === localFilters.union) ||
          []
        : selectedRegion.unions || [];

      totalUnions = unionsToCount.length;

      unionsToCount.forEach((union) => {
        // Count union responsible persons
        totalPersons += (union.unionResponsible || []).length;

        const wardsToCount = localFilters.ward
          ? (union.wards || []).filter((w) => w.id === localFilters.ward)
          : union.wards || [];

        totalWards += wardsToCount.length;

        // Count ward persons
        wardsToCount.forEach((ward) => {
          totalPersons += (ward.persons || []).length;
        });
      });
    } else {
      // Pouroshova - direct wards
      const wardsToCount = localFilters.ward
        ? (selectedRegion.wards || []).filter((w) => w.id === localFilters.ward)
        : selectedRegion.wards || [];

      totalWards = wardsToCount.length;

      wardsToCount.forEach((ward) => {
        totalPersons += (ward.persons || []).length;
      });
    }

    return { totalUnions, totalWards, totalPersons };
  };

  const availableUnions = getAvailableUnions();
  const availableWards = getAvailableWards();
  const filterStats = getFilterStats();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4 mb-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Region Filter */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            অঞ্চল নির্বাচন করুন
          </label>
          <select
            value={localFilters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">সব অঞ্চল</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Union Filter */}
        {localFilters.region && availableUnions.length > 0 && (
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ইউনিয়ন নির্বাচন করুন
            </label>
            <select
              value={localFilters.union}
              onChange={(e) => handleFilterChange("union", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">সব ইউনিয়ন</option>
              {availableUnions.map((union) => (
                <option key={union.id} value={union.id}>
                  {union.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ward Filter */}
        {localFilters.region && availableWards.length > 0 && (
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ওয়ার্ড নির্বাচন করুন
            </label>
            <select
              value={localFilters.ward}
              onChange={(e) => handleFilterChange("ward", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">সব ওয়ার্ড</option>
              {availableWards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name} {ward.unionName ? `(${ward.unionName})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Button */}
        {(localFilters.region || localFilters.union || localFilters.ward) && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
            >
              ফিল্টার সাফ করুন
            </button>
          </div>
        )}
      </div>

      {/* Filter Stats */}
      {filterStats && (
        <div className="border-t border-blue-200 pt-4">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            {filterStats.totalUnions > 0 && (
              <span>
                ইউনিয়ন: <strong>{filterStats.totalUnions}</strong>
              </span>
            )}
            <span>
              ওয়ার্ড: <strong>{filterStats.totalWards}</strong>
            </span>
            <span>
              মোট দায়িত্বশীল: <strong>{filterStats.totalPersons}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(localFilters.region || localFilters.union || localFilters.ward) && (
        <div className="border-t border-blue-200 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">
              সক্রিয় ফিল্টার:
            </span>

            {localFilters.region && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {regions.find((r) => r.id === localFilters.region)?.name}
                <button
                  onClick={() => handleFilterChange("region", "")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  title="ফিল্টার সরান"
                >
                  ✕
                </button>
              </span>
            )}

            {localFilters.union && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {availableUnions.find((u) => u.id === localFilters.union)?.name}
                <button
                  onClick={() => handleFilterChange("union", "")}
                  className="ml-1 text-green-600 hover:text-green-800"
                  title="ফিল্টার সরান"
                >
                  ✕
                </button>
              </span>
            )}

            {localFilters.ward && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                {availableWards.find((w) => w.id === localFilters.ward)?.name}
                <button
                  onClick={() => handleFilterChange("ward", "")}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                  title="ফিল্টার সরান"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
