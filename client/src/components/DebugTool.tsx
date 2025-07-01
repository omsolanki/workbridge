import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getProfile } from "../store/slices/authSlice";

const DebugTool: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem("token");
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if debug mode is enabled via environment variable
  const isDebugEnabled = import.meta.env.VITE_DEBUG_MODE === "true";

  // Don't render if debug mode is disabled
  if (!isDebugEnabled) {
    return null;
  }

  const handleGetProfile = () => {
    dispatch(getProfile());
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Debug Info</h3>
            <button
              onClick={toggleExpanded}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-xs space-y-1">
            <div>
              <strong>Token in localStorage:</strong> {token ? "Yes" : "No"}
            </div>
            <div>
              <strong>Token value:</strong>{" "}
              {token ? `${token.substring(0, 20)}...` : "None"}
            </div>
            <div>
              <strong>isAuthenticated:</strong>{" "}
              {auth.isAuthenticated ? "Yes" : "No"}
            </div>
            <div>
              <strong>Loading:</strong> {auth.loading ? "Yes" : "No"}
            </div>
            <div>
              <strong>User:</strong>{" "}
              {auth.user
                ? `${auth.user.firstName} ${auth.user.lastName}`
                : "None"}
            </div>
            <div>
              <strong>User ID:</strong> {auth.user?.id || "None"}
            </div>
            <div>
              <strong>User Role:</strong> {auth.user?.role || "None"}
            </div>
            <div>
              <strong>Error:</strong> {auth.error || "None"}
            </div>
            <div>
              <strong>Token in Redux:</strong> {auth.token ? "Yes" : "No"}
            </div>
          </div>
          <button
            onClick={handleGetProfile}
            className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test GetProfile
          </button>
        </div>
      ) : (
        <button
          onClick={toggleExpanded}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Debug Info"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DebugTool;
