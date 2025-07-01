import { describe, it, expect, vi } from "vitest";
import authReducer, { logout, clearError, setToken } from "../authSlice";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe("Auth Slice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state).toEqual({
      user: null,
      token: undefined, // getInitialToken() returns undefined in test environment
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  it("should handle logout", () => {
    const initialState = {
      user: {
        _id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "freelancer" as const,
        isVerified: true,
      },
      token: "mock-token",
      isAuthenticated: true,
      loading: false,
      error: null,
    };

    const state = authReducer(initialState, logout());

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });

  it("should handle clearError", () => {
    const stateWithError = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: "Some error",
    };

    const state = authReducer(stateWithError, clearError());

    expect(state.error).toBe(null);
  });

  it("should handle setToken", () => {
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };

    const token = "new-token";
    const state = authReducer(initialState, setToken(token));

    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("token", token);
  });
});
