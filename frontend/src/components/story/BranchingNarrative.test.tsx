import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BranchingNarrative, NarrativePath, JourneyMood } from "./BranchingNarrative";

describe("BranchingNarrative", () => {
  const defaultProps = {
    storyId: "test-story-1",
    currentPath: "location" as NarrativePath,
    journeyMood: "emotional" as JourneyMood,
    onPathChange: vi.fn(),
    onMoodChange: vi.fn(),
  };

  it("renders all narrative path options", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    expect(screen.getByText("Tell me about this place")).toBeInTheDocument();
    expect(screen.getByText("Show survivor testimony")).toBeInTheDocument();
    expect(screen.getByText("Historical context")).toBeInTheDocument();
    expect(screen.getByText("Kids version")).toBeInTheDocument();
    expect(screen.getByText("60-second summary")).toBeInTheDocument();
  });

  it("displays path descriptions", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    expect(screen.getByText("Geographic and cultural context")).toBeInTheDocument();
    expect(screen.getByText("Personal voices and stories")).toBeInTheDocument();
    expect(screen.getByText("Deeper historical background")).toBeInTheDocument();
    expect(screen.getByText("Age-appropriate retelling")).toBeInTheDocument();
    expect(screen.getByText("Quick overview")).toBeInTheDocument();
  });

  it("displays duration for each path", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    expect(screen.getByText("3 min")).toBeInTheDocument();
    expect(screen.getByText("8 min")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText("4 min")).toBeInTheDocument();
    expect(screen.getByText("1 min")).toBeInTheDocument();
  });

  it("calls onPathChange when a path is selected", () => {
    const onPathChange = vi.fn();
    render(<BranchingNarrative {...defaultProps} onPathChange={onPathChange} />);
    
    fireEvent.click(screen.getByText("Show survivor testimony"));
    expect(onPathChange).toHaveBeenCalledWith("testimony");
  });

  it("highlights the current path", () => {
    render(<BranchingNarrative {...defaultProps} currentPath="testimony" />);
    
    const testimonyButton = screen.getByText("Show survivor testimony").closest("button");
    expect(testimonyButton).toHaveClass("bg-amber");
  });

  it("shows Journey Mood selector", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    expect(screen.getByText("Journey Mood")).toBeInTheDocument();
    // The mood value is displayed in lowercase
    expect(screen.getByText("emotional")).toBeInTheDocument();
  });

  it("expands mood options when clicked", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    // Click to expand mood picker
    fireEvent.click(screen.getByText("Journey Mood"));
    
    // All mood options should be visible
    expect(screen.getByText("Deep, reflective experience")).toBeInTheDocument();
    expect(screen.getByText("Educational")).toBeInTheDocument();
    expect(screen.getByText("Focus on facts and context")).toBeInTheDocument();
    expect(screen.getByText("Fast Summary")).toBeInTheDocument();
  });

  it("calls onMoodChange when a mood is selected", () => {
    const onMoodChange = vi.fn();
    render(<BranchingNarrative {...defaultProps} onMoodChange={onMoodChange} />);
    
    // Expand mood picker
    fireEvent.click(screen.getByText("Journey Mood"));
    
    // Select a different mood
    fireEvent.click(screen.getByText("Educational"));
    expect(onMoodChange).toHaveBeenCalledWith("educational");
  });

  it("respects availablePaths prop", () => {
    render(
      <BranchingNarrative 
        {...defaultProps} 
        availablePaths={["location", "summary"]} 
      />
    );
    
    // Available paths should be clickable
    const locationButton = screen.getByText("Tell me about this place").closest("button");
    expect(locationButton).not.toBeDisabled();
    
    // Unavailable paths should be disabled
    const testimonyButton = screen.getByText("Show survivor testimony").closest("button");
    expect(testimonyButton).toBeDisabled();
  });

  it("shows story adaptation indicator", () => {
    render(<BranchingNarrative {...defaultProps} />);
    
    expect(screen.getByText("Story adapts based on your choices")).toBeInTheDocument();
  });
});
