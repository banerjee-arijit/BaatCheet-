import React, { useState } from "react";
import {
  Bell,
  Lock,
  Globe,
  Shield,
  Trash2,
  HelpCircle,
  Info,
} from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Notifications Section */}
        <div className="rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications for new messages
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound</p>
                <p className="text-sm text-gray-500">
                  Play sound for notifications
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Privacy
          </h2>

          <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your password</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Other Settings */}
        <div className="rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Other
          </h2>

          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5" />
                <p className="font-medium">Help & Support</p>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5" />
                <p className="font-medium">About</p>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <p className="font-medium">Delete Account</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-gray-400">
          <p>Baat Cheet v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
