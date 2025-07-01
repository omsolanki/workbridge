import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "../App";
import authReducer from "../store/slices/authSlice";
import jobsReducer from "../store/slices/jobsSlice";
import proposalsReducer from "../store/slices/proposalsSlice";
import contractsReducer from "../store/slices/contractsSlice";

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobsReducer,
      proposals: proposalsReducer,
      contracts: contractsReducer,
    },
  });
};

// Mock the Layout component
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

describe("App", () => {
  it("renders without crashing", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // App should render the login page when not authenticated
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to your WorkBridge account")
    ).toBeInTheDocument();
  });

  it("renders login form", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Check for login form elements
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });
});
