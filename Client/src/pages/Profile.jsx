import React, { useState } from "react";
import { Camera, User, Mail, Calendar } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Profile = () => {
  const { user, isProfileUpdating, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);

      try {
        await updateProfile({ profilePicture: base64Image });
      } catch (error) {
        console.error("Error updating profile image:", error);
      }
    };
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Profile</h1>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-inner">
              <img
                src={
                  selectedImage || user?.profilePicture || "/default-avatar.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 rounded-full p-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-md cursor-pointer transition">
              <Camera className="w-5 h-5 text-gray-700" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mb-10">
          {isProfileUpdating
            ? "Updating..."
            : "Click on the camera to update your profile image"}
        </p>

        {/* User Info Section */}
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <input
              type="text"
              defaultValue={user?.username || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Member Since
            </label>
            <input
              type="text"
              value="January 2024"
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-500"
            />
          </div>

          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Status
            </label>
            <p className="text-green-600 font-semibold">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
