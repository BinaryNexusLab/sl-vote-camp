import React, { useState, useEffect, useRef } from "react";
import RegionCard from "./components/RegionCard";
import ModalForm from "./components/ModalForm";
import FilterBar from "./components/FilterBar";
import {
  loadData,
  saveData,
  resetToInitial,
  subscribeToData,
} from "./utils/storage";
import { generatePersonId, generateWardId } from "./utils/ids";

function App() {
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const unsubscribeRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    region: "",
    union: "",
    ward: "",
  });
  const [modal, setModal] = useState({
    isOpen: false,
    type: "", // 'union', 'ward', 'person', 'union-person'
    title: "",
    initialData: null,
    context: null, // Additional context for operations
  });

  // Set up optimized data loading with instant cache
  useEffect(() => {
    const setupDataSubscription = () => {
      try {
        setLoading(true);

        // Step 1: Load cached data instantly for immediate UI
        loadData()
          .then((cachedData) => {
            console.log("Initial data loaded:", cachedData.length, "regions");
            setRegions(cachedData);
            setFilteredRegions(cachedData);
            setLoading(false); // Show UI immediately with cached data

            // Step 2: Set up real-time subscription for live updates
            const unsubscribe = subscribeToData((liveData) => {
              console.log(
                "Real-time update received:",
                liveData.length,
                "regions"
              );

              // Check if this update is from our recent save
              const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
              const isRecentSave = timeSinceLastSave < 3000; // 3 seconds

              if (isRecentSave) {
                console.log(
                  "Ignoring real-time update - recent local save detected"
                );
                setIsConnected(true);
                return;
              }

              // Get current regions state by comparing with the regions state
              setRegions((currentRegions) => {
                // Only update if data actually changed from current state
                if (
                  JSON.stringify(liveData) !== JSON.stringify(currentRegions)
                ) {
                  console.log(
                    "Data changed from external source, updating state"
                  );
                  return liveData;
                } else {
                  console.log("No changes detected, keeping current state");
                  return currentRegions;
                }
              });

              setIsConnected(true);
            });

            unsubscribeRef.current = unsubscribe;
          })
          .catch((error) => {
            console.error("Failed to load initial data:", error);
            setLoading(false);
            setIsConnected(false);
          });
      } catch (error) {
        console.error("Failed to setup data loading:", error);
        setLoading(false);
        setIsConnected(false);
      }
    };

    setupDataSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Apply filters whenever regions or filters change
  useEffect(() => {
    if (!regions.length) return;

    let filtered = [...regions];

    // Apply region filter
    if (filters.region) {
      filtered = filtered.filter((region) => region.id === filters.region);
    }

    // Apply union and ward filters
    if (filters.union || filters.ward) {
      filtered = filtered.map((region) => {
        if (!region.hasUnions) {
          // For pouroshova, filter wards directly
          if (filters.ward) {
            return {
              ...region,
              wards:
                region.wards?.filter((ward) => ward.id === filters.ward) || [],
            };
          }
          return region;
        } else {
          // For regions with unions
          let filteredUnions = [...(region.unions || [])];

          // Filter by union
          if (filters.union) {
            filteredUnions = filteredUnions.filter(
              (union) => union.id === filters.union
            );
          }

          // Filter by ward within unions
          if (filters.ward) {
            filteredUnions = filteredUnions
              .map((union) => ({
                ...union,
                wards:
                  union.wards?.filter((ward) => ward.id === filters.ward) || [],
              }))
              .filter(
                (union) => union.wards.length > 0 || union.id === filters.union
              );
          }

          return {
            ...region,
            unions: filteredUnions,
          };
        }
      });
    }

    setFilteredRegions(filtered);
  }, [regions, filters]);

  // Save data with debounce to prevent conflicts
  useEffect(() => {
    if (!loading && regions.length > 0) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Show saving indicator
      setIsSaving(true);

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(async () => {
        console.log("Saving data to Firebase...");
        lastSaveTimeRef.current = Date.now(); // Record save time
        try {
          await saveData(regions);
          console.log("Data saved successfully");
        } catch (error) {
          console.error("Failed to save data:", error);
        } finally {
          setIsSaving(false); // Hide saving indicator
        }
      }, 1000); // 1 second debounce - increased for better UX
    }

    // Cleanup timeout on component unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        setIsSaving(false);
      }
    };
  }, [regions, loading]);

  // Helper function to update regions state
  const updateRegions = (updater) => {
    setRegions((prevRegions) => updater(prevRegions));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Close modal
  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "",
      title: "",
      initialData: null,
      context: null,
    });
  };

  // Open modal for different operations
  const openModal = (type, title, initialData = null, context = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      initialData,
      context,
    });
  };

  // Union Operations
  const handleEditUnion = (union) => {
    openModal("union", "ইউনিয়ন নাম সম্পাদনা করুন", union, {
      unionId: union.id,
    });
  };

  const handleSubmitUnion = (formData) => {
    updateRegions((prevRegions) =>
      prevRegions.map((region) => ({
        ...region,
        unions: region.unions?.map((union) =>
          union.id === modal.context.unionId
            ? { ...union, name: formData.name }
            : union
        ),
      }))
    );
  };

  // Ward Operations
  const handleAddWard = (parentId) => {
    // parentId can be unionId or regionId (for pouroshova)
    openModal("ward", "নতুন ওয়ার্ড যোগ করুন", null, { parentId });
  };

  const handleEditWard = (ward, parentId) => {
    openModal("ward", "ওয়ার্ড সম্পাদনা করুন", ward, {
      wardId: ward.id,
      parentId: parentId,
    });
  };

  const handleSubmitWard = (formData) => {
    const { parentId, wardId } = modal.context;

    updateRegions((prevRegions) =>
      prevRegions.map((region) => {
        // Handle pouroshova direct wards
        if (region.id === parentId && !region.hasUnions) {
          if (wardId) {
            // Edit existing ward
            return {
              ...region,
              wards: region.wards.map((ward) =>
                ward.id === wardId ? { ...ward, name: formData.name } : ward
              ),
            };
          } else {
            // Add new ward
            const newWard = {
              id: generateWardId(),
              name: formData.name,
              persons: [],
            };
            return {
              ...region,
              wards: [...(region.wards || []), newWard],
            };
          }
        }

        // Handle union wards
        return {
          ...region,
          unions: region.unions?.map((union) => {
            if (union.id === parentId) {
              if (wardId) {
                // Edit existing ward
                return {
                  ...union,
                  wards: union.wards.map((ward) =>
                    ward.id === wardId ? { ...ward, name: formData.name } : ward
                  ),
                };
              } else {
                // Add new ward
                const newWard = {
                  id: generateWardId(),
                  name: formData.name,
                  persons: [],
                };
                return {
                  ...union,
                  wards: [...(union.wards || []), newWard],
                };
              }
            }
            return union;
          }),
        };
      })
    );
  };

  const handleDeleteWard = (parentId, wardId) => {
    updateRegions((prevRegions) =>
      prevRegions.map((region) => {
        // Handle pouroshova direct wards
        if (region.id === parentId && !region.hasUnions) {
          return {
            ...region,
            wards: region.wards.filter((ward) => ward.id !== wardId),
          };
        }

        // Handle union wards
        return {
          ...region,
          unions: region.unions?.map((union) =>
            union.id === parentId
              ? {
                  ...union,
                  wards: union.wards.filter((ward) => ward.id !== wardId),
                }
              : union
          ),
        };
      })
    );
  };

  // Union Person Operations
  const handleAddUnionPerson = (unionId) => {
    openModal("union-person", "ইউনিয়ন দায়িত্বশীল যোগ করুন", null, {
      unionId,
    });
  };

  const handleEditUnionPerson = (person, unionId) => {
    openModal("union-person", "ইউনিয়ন দায়িত্বশীল সম্পাদনা করুন", person, {
      personId: person.id,
      unionId: unionId,
    });
  };

  const handleSubmitUnionPerson = (formData) => {
    const { unionId, personId } = modal.context;

    updateRegions((prevRegions) =>
      prevRegions.map((region) => ({
        ...region,
        unions: region.unions?.map((union) => {
          if (union.id === unionId) {
            if (personId) {
              // Edit existing person
              return {
                ...union,
                unionResponsible: union.unionResponsible.map((person) =>
                  person.id === personId
                    ? { ...person, name: formData.name, phone: formData.phone }
                    : person
                ),
              };
            } else {
              // Add new person
              const newPerson = {
                id: generatePersonId(),
                name: formData.name,
                phone: formData.phone,
              };
              return {
                ...union,
                unionResponsible: [
                  ...(union.unionResponsible || []),
                  newPerson,
                ],
              };
            }
          }
          return union;
        }),
      }))
    );
  };

  const handleDeleteUnionPerson = (unionId, personId) => {
    updateRegions((prevRegions) =>
      prevRegions.map((region) => ({
        ...region,
        unions: region.unions?.map((union) =>
          union.id === unionId
            ? {
                ...union,
                unionResponsible: union.unionResponsible.filter(
                  (person) => person.id !== personId
                ),
              }
            : union
        ),
      }))
    );
  };

  // Ward Person Operations
  const handleAddWardPerson = (parentId, wardId) => {
    openModal("person", "ওয়ার্ড দায়িত্বশীল যোগ করুন", null, {
      parentId,
      wardId,
    });
  };

  const handleEditWardPerson = (person, parentId, wardId) => {
    openModal("person", "ওয়ার্ড দায়িত্বশীল সম্পাদনা করুন", person, {
      personId: person.id,
      parentId: parentId,
      wardId: wardId,
    });
  };

  const handleSubmitWardPerson = (formData) => {
    const { parentId, wardId, personId } = modal.context;

    updateRegions((prevRegions) =>
      prevRegions.map((region) => {
        // Handle pouroshova direct wards
        if (region.id === parentId && !region.hasUnions) {
          return {
            ...region,
            wards: region.wards.map((ward) => {
              if (ward.id === wardId) {
                if (personId) {
                  // Edit existing person
                  return {
                    ...ward,
                    persons: ward.persons.map((person) =>
                      person.id === personId
                        ? {
                            ...person,
                            name: formData.name,
                            phone: formData.phone,
                          }
                        : person
                    ),
                  };
                } else {
                  // Add new person
                  const newPerson = {
                    id: generatePersonId(),
                    name: formData.name,
                    phone: formData.phone,
                  };
                  return {
                    ...ward,
                    persons: [...(ward.persons || []), newPerson],
                  };
                }
              }
              return ward;
            }),
          };
        }

        // Handle union wards
        return {
          ...region,
          unions: region.unions?.map((union) => ({
            ...union,
            wards: union.wards.map((ward) => {
              if (ward.id === wardId) {
                if (personId) {
                  // Edit existing person
                  return {
                    ...ward,
                    persons: ward.persons.map((person) =>
                      person.id === personId
                        ? {
                            ...person,
                            name: formData.name,
                            phone: formData.phone,
                          }
                        : person
                    ),
                  };
                } else {
                  // Add new person
                  const newPerson = {
                    id: generatePersonId(),
                    name: formData.name,
                    phone: formData.phone,
                  };
                  return {
                    ...ward,
                    persons: [...(ward.persons || []), newPerson],
                  };
                }
              }
              return ward;
            }),
          })),
        };
      })
    );
  };

  const handleDeleteWardPerson = (parentId, wardId, personId) => {
    updateRegions((prevRegions) =>
      prevRegions.map((region) => {
        // Handle pouroshova direct wards
        if (region.id === parentId && !region.hasUnions) {
          return {
            ...region,
            wards: region.wards.map((ward) =>
              ward.id === wardId
                ? {
                    ...ward,
                    persons: ward.persons.filter(
                      (person) => person.id !== personId
                    ),
                  }
                : ward
            ),
          };
        }

        // Handle union wards
        return {
          ...region,
          unions: region.unions?.map((union) => ({
            ...union,
            wards: union.wards.map((ward) =>
              ward.id === wardId
                ? {
                    ...ward,
                    persons: ward.persons.filter(
                      (person) => person.id !== personId
                    ),
                  }
                : ward
            ),
          })),
        };
      })
    );
  };

  // Handle modal form submission
  const handleModalSubmit = (formData) => {
    switch (modal.type) {
      case "union":
        handleSubmitUnion(formData);
        break;
      case "ward":
        handleSubmitWard(formData);
        break;
      case "union-person":
        handleSubmitUnionPerson(formData);
        break;
      case "person":
        handleSubmitWardPerson(formData);
        break;
      default:
        console.warn("Unknown modal type:", modal.type);
    }
  };

  // Reset data handler
  const handleResetData = async () => {
    if (
      window.confirm(
        "আপনি কি নিশ্চিত যে সব তথ্য মূল অবস্থায় ফিরিয়ে নিতে চান?"
      )
    ) {
      try {
        const initialData = await resetToInitial();
        setRegions(initialData);
        setFilters({ region: "", union: "", ward: "" });
      } catch (error) {
        console.error("Failed to reset data:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  নির্বাচনী ক্যাম্প ব্যবস্থাপনা সিস্টেম
                </h1>
                <span className="text-sm text-gray-600 mt-1 sm:mt-0">
                  (Managed by - Engr. MD. Farman Sikder)
                </span>
              </div>
              {/* Firebase Connection Status */}
              <div className="flex items-center space-x-2">
                {isSaving ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : isConnected ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Real-time Updates</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Local</span>
                  </div>
                )}
              </div>
            </div>
            {/* <div className="flex space-x-2">
              <button
                onClick={handleResetData}
                className="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded transition-colors"
                title="ফাইল থেকে সর্বশেষ ডেটা লোড করুন"
              >
                ডেটা রিফ্রেশ করুন
              </button>
              <button
                onClick={handleResetData}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                মূল তথ্যে ফিরে যান
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Bar */}
        <FilterBar
          regions={regions}
          onFilterChange={handleFilterChange}
          activeFilters={filters}
        />

        {/* Results */}
        {filteredRegions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredRegions.map((region) => (
              <RegionCard
                key={region.id}
                region={region}
                onRegionActions={{
                  onEditUnion: handleEditUnion,
                  onAddWard: handleAddWard,
                  onEditWard: handleEditWard,
                  onDeleteWard: handleDeleteWard,
                  onAddUnionPerson: handleAddUnionPerson,
                  onEditUnionPerson: handleEditUnionPerson,
                  onDeleteUnionPerson: handleDeleteUnionPerson,
                  onAddWardPerson: handleAddWardPerson,
                  onEditWardPerson: handleEditWardPerson,
                  onDeleteWardPerson: handleDeleteWardPerson,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filters.region || filters.union || filters.ward
                ? "নির্বাচিত ফিল্টার অনুযায়ী কোন তথ্য পাওয়া যায়নি।"
                : "কোন তথ্য পাওয়া যায়নি।"}
            </p>
            {(filters.region || filters.union || filters.ward) && (
              <button
                onClick={() => setFilters({ region: "", union: "", ward: "" })}
                className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                সব ফিল্টার সাফ করুন
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalForm
        isOpen={modal.isOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        title={modal.title}
        type={modal.type}
        initialData={modal.initialData}
      />
    </div>
  );
}

export default App;
