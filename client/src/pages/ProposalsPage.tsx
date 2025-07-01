import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchProposals } from "../store/slices/proposalsSlice";
import { fetchMyJobs } from "../store/slices/jobsSlice";
import toast from "react-hot-toast";

const ProposalsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myJobs } = useSelector((state: RootState) => state.jobs);
  const { proposals, loading } = useSelector(
    (state: RootState) => state.proposals
  );

  const [activeTab, setActiveTab] = useState("my-proposals");
  const [selectedJob, setSelectedJob] = useState<string>("all");

  useEffect(() => {
    if (user?.role === "freelancer") {
      // For freelancers, fetch their proposals
      dispatch(fetchProposals());
    } else if (user?.role === "client") {
      // For clients, fetch their jobs first, then proposals for selected job
      dispatch(fetchMyJobs());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === "client" && selectedJob !== "all") {
      dispatch(fetchProposals(selectedJob));
    } else if (user?.role === "client" && selectedJob === "all") {
      // Fetch all proposals for client's jobs
      dispatch(fetchProposals());
    }
  }, [dispatch, user, selectedJob]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderFreelancerProposals = () => (
    <div className="space-y-4">
      {proposals.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-600">
            Start applying to jobs to see your proposals here
          </p>
        </div>
      ) : (
        proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {proposal.job.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      proposal.status
                    )}`}
                  >
                    {proposal.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p>
                    Client: {proposal.job.client.firstName}{" "}
                    {proposal.job.client.lastName}
                  </p>
                  <p>Submitted: {formatDate(proposal.createdAt)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Your Proposal
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {proposal.coverLetter}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-600">Proposed Amount:</span>
                    <span className="font-medium text-gray-900 ml-1">
                      ${proposal.proposedAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Duration:</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {proposal.estimatedDuration} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-6 flex flex-col space-y-2">
                {proposal.status === "pending" && (
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Withdraw
                  </button>
                )}
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Job
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderClientProposals = () => (
    <div>
      {/* Job Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Job
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Jobs</option>
          {myJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No proposals yet
            </h3>
            <p className="text-gray-600">
              Proposals for your jobs will appear here
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.job.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        proposal.status
                      )}`}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {proposal.freelancer.firstName?.charAt(0)}
                          {proposal.freelancer.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {proposal.freelancer.firstName}{" "}
                          {proposal.freelancer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          @{proposal.freelancer.username}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(proposal.createdAt)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Cover Letter
                    </h4>
                    <p className="text-gray-700 text-sm">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-600">Proposed Amount:</span>
                      <span className="font-medium text-gray-900 ml-1">
                        ${proposal.proposedAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-medium text-gray-900 ml-1">
                        {proposal.estimatedDuration} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  {proposal.status === "pending" && (
                    <>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Accept
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Reject
                      </button>
                    </>
                  )}
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposals</h1>
          <p className="text-gray-600">
            {user?.role === "freelancer"
              ? "Track your job applications and proposals"
              : "Review proposals from freelancers for your jobs"}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === "freelancer" ? "My Proposals" : "Job Proposals"}
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : user?.role === "freelancer" ? (
              renderFreelancerProposals()
            ) : (
              renderClientProposals()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;
