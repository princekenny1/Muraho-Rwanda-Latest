import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { StoryViewer } from "./StoryViewer";

// Mock the TimeOfDay context
vi.mock("@/components/ambient/TimeOfDayMode", () => ({
  useTimeOfDay: () => ({
    isNightMode: false,
    timeOfDay: "day",
    themeOverrides: {
      background: "#1a1a2e",
      textPrimary: "#ffffff",
    },
  }),
}));

describe("StoryViewer Integration", () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Content Warning Flow", () => {
    it("shows content warning for sensitive stories", () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      
      expect(screen.getByText("Content Warning")).toBeInTheDocument();
      expect(screen.getByText(/sensitive historical content/i)).toBeInTheDocument();
    });

    it("displays continue and skip options", () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      
      expect(screen.getByText("Continue")).toBeInTheDocument();
      expect(screen.getByText("Skip Story")).toBeInTheDocument();
    });

    it("shows story content after clicking continue", async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      
      fireEvent.click(screen.getByText("Continue"));
      
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    });

    it("calls onBack when skip is clicked", () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      
      fireEvent.click(screen.getByText("Skip Story"));
      
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe("Main Story View", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("displays story title and category", async () => {
      await renderStoryView();
      
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      // Multiple "Remembrance" elements exist - use getAllBy and check at least one is present
      const remembranceElements = screen.getAllByText("Remembrance");
      expect(remembranceElements.length).toBeGreaterThan(0);
    });

    it("displays story tags", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Memorial")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("1994")).toBeInTheDocument();
    });

    it("shows back button that calls onBack", async () => {
      await renderStoryView();
      
      // Find the back button (first button in header)
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe("Then & Now Slider Integration", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("shows Then & Now toggle button", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Then & Now")).toBeInTheDocument();
    });

    it("toggles Then & Now slider when clicked", async () => {
      await renderStoryView();
      
      const thenNowButton = screen.getByText("Then & Now");
      fireEvent.click(thenNowButton);
      
      // Should show the slider with image comparison - check for year labels
      await waitFor(() => {
        // There are multiple 1994 elements (tag and slider label) - use getAllBy
        const yearLabels = screen.getAllByText("1994");
        expect(yearLabels.length).toBeGreaterThan(1); // One more after slider opens
      });
    });
  });

  describe("Soundbed Picker Integration", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("displays soundbed picker with all options", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Background Soundbed")).toBeInTheDocument();
      expect(screen.getByText("Silence")).toBeInTheDocument();
      expect(screen.getByText("Ambient Wind")).toBeInTheDocument();
      expect(screen.getByText("Nature Sounds")).toBeInTheDocument();
      expect(screen.getByText("Kigali City")).toBeInTheDocument();
      expect(screen.getByText("Night Sounds")).toBeInTheDocument();
    });

    it("allows selecting different soundbeds", async () => {
      await renderStoryView();
      
      const natureSoundsButton = screen.getByText("Nature Sounds").closest("button");
      fireEvent.click(natureSoundsButton!);
      
      // The button should now have active styling
      expect(natureSoundsButton).toHaveClass("bg-amber/20");
    });

    it("shows volume slider when soundbed is selected", async () => {
      await renderStoryView();
      
      // Select a soundbed (not silence)
      fireEvent.click(screen.getByText("Ambient Wind").closest("button")!);
      
      // Volume slider should appear (there are now 2 sliders - Then/Now and volume)
      await waitFor(() => {
        const sliders = screen.getAllByRole("slider");
        expect(sliders.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Branching Narrative Integration", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("shows Choose Path button in hero", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Choose Path")).toBeInTheDocument();
    });

    it("reveals branching narrative when Choose Path is clicked", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Choose Path"));
      
      await waitFor(() => {
        expect(screen.getByText("Journey Mood")).toBeInTheDocument();
        expect(screen.getByText("Choose how to explore")).toBeInTheDocument();
      });
    });

    it("displays all narrative path options", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Choose Path"));
      
      await waitFor(() => {
        expect(screen.getByText("Tell me about this place")).toBeInTheDocument();
        expect(screen.getByText("Show survivor testimony")).toBeInTheDocument();
        expect(screen.getByText("Historical context")).toBeInTheDocument();
        expect(screen.getByText("Kids version")).toBeInTheDocument();
        expect(screen.getByText("60-second summary")).toBeInTheDocument();
      });
    });

    it("allows selecting different narrative paths", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Choose Path"));
      
      await waitFor(() => {
        expect(screen.getByText("Show survivor testimony")).toBeInTheDocument();
      });
      
      const testimonyButton = screen.getByText("Show survivor testimony").closest("button");
      fireEvent.click(testimonyButton!);
      
      // Should now have active styling
      expect(testimonyButton).toHaveClass("bg-amber");
    });

    it("expands journey mood picker", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Choose Path"));
      
      await waitFor(() => {
        expect(screen.getByText("Journey Mood")).toBeInTheDocument();
      });
      
      // Click to expand mood picker
      fireEvent.click(screen.getByText("Journey Mood"));
      
      await waitFor(() => {
        expect(screen.getByText("Educational")).toBeInTheDocument();
        expect(screen.getByText("Fast Summary")).toBeInTheDocument();
      });
    });

    it("allows changing journey mood", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Choose Path"));
      
      await waitFor(() => {
        expect(screen.getByText("Journey Mood")).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText("Journey Mood"));
      
      await waitFor(() => {
        expect(screen.getByText("Educational")).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText("Educational"));
      
      // Mood picker should collapse and show new mood
      await waitFor(() => {
        expect(screen.getByText("educational")).toBeInTheDocument();
      });
    });
  });

  describe("Multi-Modal Story Container Integration", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("displays mode switcher with Audio, Video, Read options", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Audio")).toBeInTheDocument();
      expect(screen.getByText("Video")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
    });

    it("defaults to Audio mode", async () => {
      await renderStoryView();
      
      const audioButton = screen.getByText("Audio").closest("button");
      expect(audioButton).toHaveClass("bg-amber");
    });

    it("switches to Video mode when clicked", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Video"));
      
      const videoButton = screen.getByText("Video").closest("button");
      expect(videoButton).toHaveClass("bg-amber");
    });

    it("switches to Read mode when clicked", async () => {
      await renderStoryView();
      
      fireEvent.click(screen.getByText("Read"));
      
      const readButton = screen.getByText("Read").closest("button");
      expect(readButton).toHaveClass("bg-amber");
    });
  });

  describe("Source Attribution Integration", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("displays sources section", async () => {
      await renderStoryView();
      
      expect(screen.getByText("Sources")).toBeInTheDocument();
    });

    it("shows institutional source chips", async () => {
      await renderStoryView();
      
      // Source chips should be visible
      expect(screen.getByText("Aegis Trust")).toBeInTheDocument();
      expect(screen.getByText("UNESCO")).toBeInTheDocument();
    });
  });

  describe("Full User Journey", () => {
    it("completes full immersive story experience", async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      
      // Step 1: Content warning
      expect(screen.getByText("Content Warning")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Continue"));
      
      // Step 2: View story
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
      
      // Step 3: Open Then & Now slider
      fireEvent.click(screen.getByText("Then & Now"));
      await waitFor(() => {
        // Multiple 1994 elements appear after slider opens
        const yearLabels = screen.getAllByText("1994");
        expect(yearLabels.length).toBeGreaterThan(1);
      });
      
      // Step 4: Select a soundbed
      fireEvent.click(screen.getByText("Nature Sounds").closest("button")!);
      expect(screen.getByText("Nature Sounds").closest("button")).toHaveClass("bg-amber/20");
      
      // Step 5: Open branching narrative
      fireEvent.click(screen.getByText("Choose Path"));
      await waitFor(() => {
        expect(screen.getByText("Journey Mood")).toBeInTheDocument();
      });
      
      // Step 6: Select a narrative path
      fireEvent.click(screen.getByText("Historical context").closest("button")!);
      expect(screen.getByText("Historical context").closest("button")).toHaveClass("bg-amber");
      
      // Step 7: Switch to Read mode
      fireEvent.click(screen.getByText("Read"));
      expect(screen.getByText("Read").closest("button")).toHaveClass("bg-amber");
      
      // Step 8: Verify sources are visible
      expect(screen.getByText("Sources")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    const renderStoryView = async () => {
      render(<StoryViewer storyId="kgm-001" onBack={mockOnBack} />);
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kigali Genocide Memorial");
      });
    };

    it("has accessible buttons with proper roles", async () => {
      await renderStoryView();
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(5);
    });

    it("uses semantic heading for story title", async () => {
      await renderStoryView();
      
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Kigali Genocide Memorial");
    });
  });
});
