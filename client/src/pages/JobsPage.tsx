import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchJobs, setFilters, clearFilters } from "../store/slices/jobsSlice";
import { jobsAPI } from "../services/api";
import toast from "react-hot-toast";

const JobsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    jobs: jobsState,
    loading,
    filters,
    pagination,
  } = useSelector((state: RootState) => state.jobs);

  // Ensure jobs is always an array
  const jobs = Array.isArray(jobsState) ? jobsState : [];
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  const categories = [
    "Web Development",
    "Mobile Development",
    "Design & Creative",
    "Writing & Translation",
    "Digital Marketing",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Data Science & Analytics",
    "Engineering & Architecture",
    "Sales & Marketing",
    "Customer Service",
    "Admin & Support",
    "Legal",
    "Accounting & Consulting",
    "Translation",
    "Other",
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  const durationOptions = [
    { value: "less-than-1-week", label: "Less than 1 week" },
    { value: "1-to-2-weeks", label: "1 to 2 weeks" },
    { value: "2-to-4-weeks", label: "2 to 4 weeks" },
    { value: "1-to-3-months", label: "1 to 3 months" },
    { value: "3-to-6-months", label: "3 to 6 months" },
    { value: "more-than-6-months", label: "More than 6 months" },
  ];

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    // Apply filters when they change
    const filterParams: any = {};

    if (searchTerm) filterParams.search = searchTerm;
    if (selectedCategory !== "all") filterParams.category = selectedCategory;
    if (selectedExperience !== "all")
      filterParams.experienceLevel = selectedExperience;
    if (selectedDuration !== "all") filterParams.duration = selectedDuration;
    if (budgetRange.min) filterParams.budgetMin = parseInt(budgetRange.min);
    if (budgetRange.max) filterParams.budgetMax = parseInt(budgetRange.max);

    dispatch(setFilters(filterParams));
  }, [
    searchTerm,
    selectedCategory,
    selectedExperience,
    selectedDuration,
    budgetRange.min,
    budgetRange.max,
    dispatch,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchJobs(filters));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedExperience("all");
    setSelectedDuration("all");
    setBudgetRange({ min: "", max: "" });
    dispatch(clearFilters());
    dispatch(fetchJobs());
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      // This would open a proposal modal or navigate to proposal page
      toast.success("Redirecting to proposal form...");
      // Navigate to proposal page or open modal
    } catch (error) {
      toast.error("Failed to apply to job");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Work</h1>
          <p className="text-gray-600">
            Browse and apply to the best freelance jobs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Any Duration</option>
                  {durationOptions.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={budgetRange.min}
                    onChange={(e) =>
                      setBudgetRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={budgetRange.max}
                    onChange={(e) =>
                      setBudgetRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {loading ? "Loading jobs..." : `${jobs.length} jobs found`}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing results for your search criteria
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {job.title}
                          </h3>
                          {job.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                          {job.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Featured
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <span>{job.category}</span>
                          <span>•</span>
                          <span>{formatDuration(job)}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {job.experienceLevel}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{job.projectType}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatBudget(job)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {job.proposalsCount} proposals
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                job.status
                              )}`}
                            >
                              {job.status}
                            </span>
                            {user?.role === "freelancer" && (
                              <button
                                onClick={() => handleApplyToJob(job.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
