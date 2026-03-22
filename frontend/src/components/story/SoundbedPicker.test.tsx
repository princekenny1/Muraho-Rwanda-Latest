import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SoundbedPicker, SoundbedType } from "./SoundbedPicker";

describe("SoundbedPicker", () => {
  const defaultProps = {
    activeSoundbed: "none" as SoundbedType,
    volume: 0.5,
    onSoundbedChange: vi.fn(),
    onVolumeChange: vi.fn(),
  };

  it("renders all soundbed options", () => {
    render(<SoundbedPicker {...defaultProps} />);
    
    expect(screen.getByText("Silence")).toBeInTheDocument();
    expect(screen.getByText("Ambient Wind")).toBeInTheDocument();
    expect(screen.getByText("Nature Sounds")).toBeInTheDocument();
    expect(screen.getByText("Kigali City")).toBeInTheDocument();
    expect(screen.getByText("Night Sounds")).toBeInTheDocument();
  });

  it("displays descriptions for each soundbed", () => {
    render(<SoundbedPicker {...defaultProps} />);
    
    expect(screen.getByText("No background audio")).toBeInTheDocument();
    expect(screen.getByText("Gentle breeze through hills")).toBeInTheDocument();
    expect(screen.getByText("Birds and rustling leaves")).toBeInTheDocument();
    expect(screen.getByText("Urban ambiance")).toBeInTheDocument();
    expect(screen.getByText("Crickets and distant echoes")).toBeInTheDocument();
  });

  it("calls onSoundbedChange when a soundbed is selected", () => {
    const onSoundbedChange = vi.fn();
    render(<SoundbedPicker {...defaultProps} onSoundbedChange={onSoundbedChange} />);
    
    fireEvent.click(screen.getByText("Nature Sounds"));
    expect(onSoundbedChange).toHaveBeenCalledWith("nature");
  });

  it("shows volume control when soundbed is not 'none'", () => {
    render(<SoundbedPicker {...defaultProps} activeSoundbed="wind" />);
    
    const volumeSlider = screen.getByRole("slider");
    expect(volumeSlider).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("hides volume control when soundbed is 'none'", () => {
    render(<SoundbedPicker {...defaultProps} activeSoundbed="none" />);
    
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  it("calls onVolumeChange when volume slider is adjusted", () => {
    const onVolumeChange = vi.fn();
    render(
      <SoundbedPicker 
        {...defaultProps} 
        activeSoundbed="nature" 
        onVolumeChange={onVolumeChange} 
      />
    );
    
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(onVolumeChange).toHaveBeenCalledWith(0.75);
  });

  it("renders in compact mode when isCompact is true", () => {
    render(<SoundbedPicker {...defaultProps} isCompact={true} />);
    
    // In compact mode, should show collapsed button
    expect(screen.getByText("Silence")).toBeInTheDocument();
    // Should not show all options initially
    expect(screen.queryByText("Ambient Wind")).not.toBeInTheDocument();
  });

  it("expands compact mode when clicked", () => {
    render(<SoundbedPicker {...defaultProps} isCompact={true} />);
    
    // Click to expand
    fireEvent.click(screen.getByText("Silence"));
    
    // Now all options should be visible
    expect(screen.getByText("Ambient Wind")).toBeInTheDocument();
    expect(screen.getByText("Nature Sounds")).toBeInTheDocument();
  });

  it("highlights the active soundbed", () => {
    render(<SoundbedPicker {...defaultProps} activeSoundbed="city" />);
    
    const cityButton = screen.getByText("Kigali City").closest("button");
    expect(cityButton).toHaveClass("bg-amber/20");
  });
});
