import { describe, it, expect } from "vitest";
import jobsReducer, {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentJob,
  clearError,
} from "../jobsSlice";

describe("Jobs Slice", () => {
  it("should return initial state", () => {
    const state = jobsReducer(undefined, { type: "unknown" });
    expect(state).toEqual({
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
    });
  });

  it("should handle setFilters", () => {
    const initialState = jobsReducer(undefined, { type: "unknown" });
    const filters = {
      category: "web-development",
      search: "React",
    };

    const state = jobsReducer(initialState, setFilters(filters));

    expect(state.filters.category).toBe("web-development");
    expect(state.filters.search).toBe("React");
    expect(state.pagination.page).toBe(1); // Should reset to first page
  });

  it("should handle clearFilters", () => {
    const stateWithFilters = {
      ...jobsReducer(undefined, { type: "unknown" }),
      filters: {
        search: "React",
        category: "web-development",
        experienceLevel: "intermediate",
        duration: "short-term",
      },
      pagination: {
        page: 3,
        limit: 10,
        total: 30,
        totalPages: 3,
      },
    };

    const state = jobsReducer(stateWithFilters, clearFilters());

    expect(state.filters).toEqual({
      search: "",
      category: "all",
      experienceLevel: "all",
      duration: "all",
    });
    expect(state.pagination.page).toBe(1);
  });

  it("should handle setPage", () => {
    const initialState = jobsReducer(undefined, { type: "unknown" });
    const page = 3;

    const state = jobsReducer(initialState, setPage(page));

    expect(state.pagination.page).toBe(page);
  });

  it("should handle clearCurrentJob", () => {
    const stateWithJob = {
      ...jobsReducer(undefined, { type: "unknown" }),
      currentJob: { _id: "1", title: "Test Job" },
    };

    const state = jobsReducer(stateWithJob, clearCurrentJob());

    expect(state.currentJob).toBe(null);
  });

  it("should handle clearError", () => {
    const stateWithError = {
      ...jobsReducer(undefined, { type: "unknown" }),
      error: "Some error",
    };

    const state = jobsReducer(stateWithError, clearError());

    expect(state.error).toBe(null);
  });
});
