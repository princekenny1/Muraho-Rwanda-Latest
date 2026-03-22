import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Transcript } from "./Transcript";

describe("Transcript", () => {
  const mockSegments = [
    { id: "1", startTime: 0, endTime: 15, text: "First segment of the transcript." },
    { id: "2", startTime: 15, endTime: 30, text: "Second segment with more content." },
    { id: "3", startTime: 30, endTime: 45, text: "Third and final segment." },
  ];

  it("renders show transcript button by default", () => {
    render(<Transcript segments={mockSegments} />);
    
    expect(screen.getByText("Show transcript")).toBeInTheDocument();
  });

  it("expands to show segments when clicked", () => {
    render(<Transcript segments={mockSegments} />);
    
    fireEvent.click(screen.getByText("Show transcript"));
    
    expect(screen.getByText("First segment of the transcript.")).toBeInTheDocument();
    expect(screen.getByText("Second segment with more content.")).toBeInTheDocument();
    expect(screen.getByText("Third and final segment.")).toBeInTheDocument();
  });

  it("shows hide transcript when expanded", () => {
    render(<Transcript segments={mockSegments} isExpanded={true} />);
    
    expect(screen.getByText("Hide transcript")).toBeInTheDocument();
  });

  it("displays timestamps for each segment", () => {
    render(<Transcript segments={mockSegments} isExpanded={true} />);
    
    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByText("0:15")).toBeInTheDocument();
    expect(screen.getByText("0:30")).toBeInTheDocument();
  });

  it("highlights the active segment based on currentTime", () => {
    render(
      <Transcript 
        segments={mockSegments} 
        currentTime={20} 
        isExpanded={true} 
      />
    );
    
    // Second segment should be active at 20 seconds (between 15-30)
    const secondSegmentText = screen.getByText("Second segment with more content.");
    // The parent div with border-l-2 class is the clickable segment container
    const segmentContainer = secondSegmentText.closest('[class*="border-l-2"]');
    expect(segmentContainer).toBeInTheDocument();
  });

  it("calls onSeek when a segment is clicked", () => {
    const onSeek = vi.fn();
    render(
      <Transcript 
        segments={mockSegments} 
        onSeek={onSeek} 
        isExpanded={true} 
      />
    );
    
    fireEvent.click(screen.getByText("Third and final segment."));
    expect(onSeek).toHaveBeenCalledWith(30);
  });

  it("calls onToggle when expanded state changes", () => {
    const onToggle = vi.fn();
    render(<Transcript segments={mockSegments} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByText("Show transcript"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("uses default segments when none provided", () => {
    render(<Transcript isExpanded={true} />);
    
    // Should show default memorial content
    expect(screen.getByText(/Kigali Genocide Memorial/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Transcript segments={mockSegments} className="custom-transcript" />
    );
    
    expect(container.firstChild).toHaveClass("custom-transcript");
  });
});
