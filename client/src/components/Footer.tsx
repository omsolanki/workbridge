import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">WorkBridge</h3>
            <p className="text-gray-300">
              Connecting talented freelancers with amazing opportunities.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">For Freelancers</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Find Jobs</li>
              <li>Create Profile</li>
              <li>Get Paid</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Post Jobs</li>
              <li>Hire Talent</li>
              <li>Manage Projects</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 WorkBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
