import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobsAPI, Job } from "../../services/api";

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  myJobs: Job[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    experienceLevel: string;
    budgetMin?: number;
    budgetMax?: number;
    duration: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  myJobs: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    category: "all",
    experienceLevel: "all",
    duration: "all",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params?: {
    search?: string;
    category?: string;
    experienceLevel?: string;
    budgetMin?: number;
    budgetMax?: number;
    duration?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await jobsAPI.getJobs(params);
    return response;
  }
);

export const fetchJob = createAsyncThunk(
  "jobs/fetchJob",
  async (id: string) => {
    const response = await jobsAPI.getJob(id);
    return response;
  }
);

export const fetchMyJobs = createAsyncThunk("jobs/fetchMyJobs", async () => {
  const response = await jobsAPI.getMyJobs();
  return response;
});

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData: Partial<Job>) => {
    const response = await jobsAPI.createJob(jobData);
    return response;
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, jobData }: { id: string; jobData: Partial<Job> }) => {
    const response = await jobsAPI.updateJob(id, jobData);
    return response;
  }
);

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (id: string) => {
    await jobsAPI.deleteJob(id);
    return id;
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<JobsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: { jobs: [...], pagination: {...} } }
        if (action.payload.data) {
          state.jobs = action.payload.data.jobs || [];
          if (action.payload.data.pagination) {
            state.pagination = action.payload.data.pagination;
          }
        } else {
          // Fallback for old structure
          state.jobs = action.payload.jobs || action.payload || [];
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })

      // Fetch single job
      .addCase(fetchJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: {...} }
        state.currentJob = action.payload.data || action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch job";
      })

      // Fetch my jobs
      .addCase(fetchMyJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: [...] }
        state.myJobs = action.payload.data || action.payload;
      })
      .addCase(fetchMyJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch my jobs";
      })

      // Create job
      .addCase(createJob.fulfilled, (state, action) => {
        // Handle the new response structure: { success: true, data: {...} }
        const newJob = action.payload.data || action.payload;
        state.myJobs.unshift(newJob);
      })

      // Update job
      .addCase(updateJob.fulfilled, (state, action) => {
        // Handle the new response structure: { success: true, data: {...} }
        const updatedJob = action.payload.data || action.payload;
        // Update in jobs array
        const jobIndex = state.jobs.findIndex(
          (job) => job.id === updatedJob.id
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = updatedJob;
        }
        // Update in myJobs array
        const myJobIndex = state.myJobs.findIndex(
          (job) => job.id === updatedJob.id
        );
        if (myJobIndex !== -1) {
          state.myJobs[myJobIndex] = updatedJob;
        }
        // Update current job if it's the same
        if (state.currentJob?.id === updatedJob.id) {
          state.currentJob = updatedJob;
        }
      })

      // Delete job
      .addCase(deleteJob.fulfilled, (state, action) => {
        const deletedJobId = action.payload;
        state.jobs = state.jobs.filter((job) => job.id !== deletedJobId);
        state.myJobs = state.myJobs.filter((job) => job.id !== deletedJobId);
        if (state.currentJob?.id === deletedJobId) {
          state.currentJob = null;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentJob,
  clearError,
} = jobsSlice.actions;
export default jobsSlice.reducer;
