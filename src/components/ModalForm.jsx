import React, { useState, useEffect } from "react";

// ModalForm component for all add/edit operations
const ModalForm = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  type, // 'union', 'ward', 'person', 'union-person'
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          phone: initialData.phone || "",
        });
      } else {
        setFormData({
          name: "",
          phone: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name is required for all types
    if (!formData.name.trim()) {
      newErrors.name = "নাম আবশ্যক";
    }

    // Phone validation (for persons only - unions and wards don't require phone)
    if (type === "person" || type === "union-person") {
      if (!formData.phone.trim()) {
        newErrors.phone = "ফোন নম্বর আবশ্যক";
      } else if (!/^[\d+\-\s]+$/.test(formData.phone)) {
        newErrors.phone = "ফোন নম্বর সঠিক নয়";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };

      if (initialData) {
        dataToSubmit.id = initialData.id;
      }

      onSubmit(dataToSubmit);
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Determine field labels based on type
  const getNameLabel = () => {
    switch (type) {
      case "union":
        return "ইউনিয়নের নাম";
      case "ward":
        return "ওয়ার্ডের নাম";
      case "person":
      case "union-person":
        return "নাম";
      default:
        return "নাম";
    }
  };

  const showPhoneField = type === "person" || type === "union-person";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getNameLabel()} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={`${getNameLabel()} লিখুন`}
                autoFocus
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Field (only for persons) */}
            {showPhoneField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ফোন নম্বর *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ফোন নম্বর লিখুন"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {initialData ? "সংরক্ষণ করুন" : "যোগ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
