import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/error-boundary";

const ThrowingComponent = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  it("renders fallback message when child throws", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowingComponent)
      )
    );

    expect(screen.getByText("Something went wrong.")).toBeTruthy();
  });
});

