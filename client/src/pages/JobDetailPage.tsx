import React from "react";
import { useParams } from "react-router-dom";

const JobDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Details</h1>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-600">
            Job details for ID: {id} coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
