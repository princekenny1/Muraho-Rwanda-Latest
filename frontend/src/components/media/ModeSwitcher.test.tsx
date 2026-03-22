import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeSwitcher } from "./ModeSwitcher";

type ViewMode = "audio" | "video" | "read";

describe("ModeSwitcher", () => {
  const defaultProps = {
    activeMode: "audio" as ViewMode,
    onModeChange: vi.fn(),
  };

  it("renders all mode options by default", () => {
    render(<ModeSwitcher {...defaultProps} />);
    
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("calls onModeChange when a mode is clicked", () => {
    const onModeChange = vi.fn();
    render(<ModeSwitcher {...defaultProps} onModeChange={onModeChange} />);
    
    fireEvent.click(screen.getByText("Video"));
    expect(onModeChange).toHaveBeenCalledWith("video");
  });

  it("highlights the active mode", () => {
    render(<ModeSwitcher {...defaultProps} activeMode="video" />);
    
    const videoButton = screen.getByText("Video").closest("button");
    expect(videoButton).toHaveClass("bg-amber");
  });

  it("respects availableModes prop", () => {
    render(
      <ModeSwitcher 
        {...defaultProps} 
        availableModes={["audio", "read"]} 
      />
    );
    
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.queryByText("Video")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ModeSwitcher {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("switches modes correctly", () => {
    const onModeChange = vi.fn();
    render(<ModeSwitcher {...defaultProps} onModeChange={onModeChange} />);
    
    // Click Audio (already active, should still call)
    fireEvent.click(screen.getByText("Audio"));
    expect(onModeChange).toHaveBeenCalledWith("audio");
    
    // Click Read
    fireEvent.click(screen.getByText("Read"));
    expect(onModeChange).toHaveBeenCalledWith("read");
  });

  it("renders correct icons for each mode", () => {
    render(<ModeSwitcher {...defaultProps} />);
    
    // Each button should have an icon (svg)
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    
    buttons.forEach(button => {
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
