import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchJob } from "../store/slices/jobsSlice";
import { fetchProposals, createProposal } from "../store/slices/proposalsSlice";
import { jobsAPI } from "../services/api";
import toast from "react-hot-toast";

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, loading } = useSelector((state: RootState) => state.jobs);
  const { user } = useSelector((state: RootState) => state.auth);
  const { proposals, loading: proposalsLoading } = useSelector(
    (state: RootState) => state.proposals
  );

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    proposedAmount: 0,
    estimatedDuration: 0,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchJob(id));
      dispatch(fetchProposals(id));
      jobsAPI.incrementViews(id);
    }
  }, [dispatch, id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob) return;
    try {
      await dispatch(
        createProposal({
          jobId: currentJob.id,
          coverLetter: proposalData.coverLetter,
          proposedAmount: proposalData.proposedAmount,
          estimatedDuration: proposalData.estimatedDuration,
        })
      ).unwrap();
      toast.success("Proposal submitted successfully!");
      setShowApplyModal(false);
      setProposalData({
        coverLetter: "",
        proposedAmount: 0,
        estimatedDuration: 0,
      });
      dispatch(fetchProposals(currentJob.id));
    } catch (error) {
      toast.error("Failed to submit proposal");
    }
  };

  const formatBudget = (job: any) => {
    if (job.budget.type === "fixed") {
      return `$${job.budget.min.toLocaleString()} - $${job.budget.max.toLocaleString()}`;
    } else {
      return `$${job.budget.min}/hr - $${job.budget.max}/hr`;
    }
  };

  const formatDuration = (job: any) => {
    return `${job.duration.value} ${job.duration.unit}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Job not found
          </h1>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentJob.title}
                </h1>
                {currentJob.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
                {currentJob.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>
                  Posted by {currentJob.client.firstName}{" "}
                  {currentJob.client.lastName}
                </span>
                <span>•</span>
                <span>
                  {new Date(currentJob.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{currentJob.views} views</span>
                <span>•</span>
                <span>{currentJob.proposalsCount} proposals</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatBudget(currentJob)}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    currentJob.status
                  )}`}
                >
                  {currentJob.status}
                </span>
              </div>
            </div>

            {user?.role === "freelancer" && currentJob.status === "open" && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentJob.description}
                </p>
              </div>
            </div>

            {/* Skills Required */}
            {currentJob.skills && currentJob.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {currentJob.attachments && currentJob.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Attachments
                </h2>
                <div className="space-y-2">
                  {currentJob.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {attachment}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals (for client) */}
            {user?.role === "client" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Proposals
                </h2>
                {proposalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-gray-500">No proposals yet.</div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {proposal.freelancer.firstName}{" "}
                            {proposal.freelancer.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {proposal.freelancer.email}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {proposal.coverLetter}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                          <span className="text-lg font-semibold text-gray-900">
                            ${proposal.proposedAmount}
                          </span>
                          <span className="text-sm text-gray-500">
                            Est. {proposal.estimatedDuration} days
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              proposal.status
                            )}`}
                          >
                            {proposal.status}
                          </span>
                          {/* Accept/Reject buttons can be added here */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">{currentJob.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <p className="text-gray-900">{currentJob.subcategory}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <p className="text-gray-900 capitalize">
                    {currentJob.experienceLevel}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <p className="text-gray-900 capitalize">
                    {currentJob.projectType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-900">{formatDuration(currentJob)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900 capitalize">
                    {currentJob.location.type}
                  </p>
                  {currentJob.location.city && (
                    <p className="text-sm text-gray-600">
                      {currentJob.location.city}, {currentJob.location.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Client
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {currentJob.client.firstName?.charAt(0)}
                    {currentJob.client.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {currentJob.client.firstName} {currentJob.client.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    @{currentJob.client.username}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="text-gray-900">2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs posted:</span>
                  <span className="text-gray-900">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hire rate:</span>
                  <span className="text-gray-900">80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Submit Proposal
                  </h2>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
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
              </div>

              <form onSubmit={handleApply} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={proposalData.coverLetter}
                    onChange={(e) =>
                      setProposalData((prev) => ({
                        ...prev,
                        coverLetter: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe why you're the best fit for this job..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Amount ($)
                    </label>
                    <input
                      type="number"
                      value={proposalData.proposedAmount}
                      onChange={(e) =>
                        setProposalData((prev) => ({
                          ...prev,
                          proposedAmount: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (days)
                    </label>
                    <input
                      type="number"
                      value={proposalData.estimatedDuration}
                      onChange={(e) =>
                        setProposalData((prev) => ({
                          ...prev,
                          estimatedDuration: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;
