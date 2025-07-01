import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders footer content", () => {
    render(<Footer />);

    // Check for footer text - use getAllByText since WorkBridge appears multiple times
    expect(screen.getAllByText(/WorkBridge/i)).toHaveLength(2);
    expect(screen.getByText(/© 2024 WorkBridge/i)).toBeInTheDocument();
  });

  it("renders footer sections", () => {
    render(<Footer />);

    // Check for footer sections
    expect(screen.getByText(/For Freelancers/i)).toBeInTheDocument();
    expect(screen.getByText(/For Clients/i)).toBeInTheDocument();
    expect(screen.getByText(/Support/i)).toBeInTheDocument();
  });

  it("renders footer links", () => {
    render(<Footer />);

    // Check for footer links
    expect(screen.getByText(/Find Jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Post Jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Help Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  });
});
