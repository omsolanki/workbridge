import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../Layout";

// Mock the Navbar and Footer components
vi.mock("../Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("../Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

describe("Layout", () => {
  it("renders navbar, main content area, and footer", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={<div data-testid="content">Test Content</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders nested content correctly", () => {
    const testContent = "Hello, World!";
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>{testContent}</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
