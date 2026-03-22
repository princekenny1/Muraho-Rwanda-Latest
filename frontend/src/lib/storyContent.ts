import { NarrativePath, JourneyMood } from "@/components/story/BranchingNarrative";

export interface StorySegment {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  startTime: number;
  endTime: number;
}

export interface PathContent {
  segments: StorySegment[];
  description: string;
  duration: string;
}

// Content variants for the Kigali Genocide Memorial story
const kgmStoryContent: Record<NarrativePath, PathContent> = {
  location: {
    duration: "3 min",
    description: "Explore the geography and cultural significance of the memorial site.",
    segments: [
      {
        id: "loc-1",
        title: "The Gisozi District",
        content: "The Kigali Genocide Memorial is located in Gisozi, a hillside district in the northern part of Kigali. The area was chosen for its accessibility and serene environment, providing a peaceful setting for reflection and remembrance.",
        startTime: 0,
        endTime: 60,
      },
      {
        id: "loc-2",
        title: "Memorial Architecture",
        content: "The memorial complex spans over 2.5 hectares and was designed to blend with the natural landscape. The architecture reflects Rwandan traditions while incorporating modern memorial design principles. Gardens surround the burial grounds, creating spaces for contemplation.",
        startTime: 60,
        endTime: 120,
      },
      {
        id: "loc-3",
        title: "Cultural Significance",
        content: "As a UNESCO World Heritage Site candidate, the memorial represents Rwanda's commitment to preserving memory. It serves as a pilgrimage site for Rwandans and visitors worldwide, embodying the nation's journey from tragedy to reconciliation.",
        startTime: 120,
        endTime: 180,
      },
    ],
  },
  testimony: {
    duration: "8 min",
    description: "Hear personal stories from survivors and their families.",
    segments: [
      {
        id: "test-1",
        title: "Marie's Story",
        content: "Marie was only 12 years old in April 1994. 'I remember the sound of birds that morning,' she recalls. 'It was so ordinary, and then everything changed.' Marie hid for three months, protected by neighbors who risked their lives.",
        startTime: 0,
        endTime: 120,
      },
      {
        id: "test-2",
        title: "Finding Strength",
        content: "After the genocide, Marie dedicated her life to education. 'Every child I teach is a victory,' she says. 'Knowledge and understanding are our shields against hatred.' Today, she works as a guide at the memorial.",
        startTime: 120,
        endTime: 240,
      },
      {
        id: "test-3",
        title: "Jean-Pierre's Journey",
        content: "Jean-Pierre lost his entire family during the hundred days. 'For years, I couldn't speak about what happened,' he shares. 'Coming to this memorial helped me find my voice. Now I speak so the world will never forget.'",
        startTime: 240,
        endTime: 360,
      },
      {
        id: "test-4",
        title: "Reconciliation",
        content: "The memorial hosts reconciliation programs where survivors and perpetrators' families meet. 'Forgiveness is not forgetting,' explains Immaculée, a survivor. 'It is choosing to move forward without carrying the weight of hatred.'",
        startTime: 360,
        endTime: 480,
      },
    ],
  },
  historical: {
    duration: "5 min",
    description: "Understand the historical context of the 1994 genocide.",
    segments: [
      {
        id: "hist-1",
        title: "Colonial Legacy",
        content: "Rwanda's history was shaped by colonial policies that divided communities. Belgian colonial rule institutionalized ethnic divisions through identity cards, creating artificial barriers between neighbors who had lived together for centuries.",
        startTime: 0,
        endTime: 75,
      },
      {
        id: "hist-2",
        title: "The Path to 1994",
        content: "Decades of political manipulation and ethnic tensions culminated in the genocide that began on April 7, 1994. Over approximately 100 days, an estimated one million Tutsi and moderate Hutu were killed.",
        startTime: 75,
        endTime: 150,
      },
      {
        id: "hist-3",
        title: "International Response",
        content: "The international community's failure to intervene remains one of the most significant humanitarian failures of the 20th century. The UN peacekeeping force was reduced rather than reinforced as violence escalated.",
        startTime: 150,
        endTime: 225,
      },
      {
        id: "hist-4",
        title: "Rwanda's Recovery",
        content: "Since 1994, Rwanda has undergone remarkable transformation. Traditional justice mechanisms like Gacaca courts helped process over a million cases. Today, Rwanda is recognized for its reconciliation efforts and development progress.",
        startTime: 225,
        endTime: 300,
      },
    ],
  },
  kids: {
    duration: "4 min",
    description: "An age-appropriate introduction to the memorial's message of peace.",
    segments: [
      {
        id: "kids-1",
        title: "A Special Garden",
        content: "The Kigali Memorial is a very special garden where people come to remember loved ones. Just like we might keep photos of our grandparents, Rwanda keeps this beautiful place to honor people who are no longer here.",
        startTime: 0,
        endTime: 60,
      },
      {
        id: "kids-2",
        title: "Learning About Kindness",
        content: "Many years ago, some people in Rwanda forgot how to be kind to each other. The memorial teaches us why it's so important to be friends with everyone, no matter how different they might seem.",
        startTime: 60,
        endTime: 120,
      },
      {
        id: "kids-3",
        title: "Heroes and Helpers",
        content: "During that difficult time, there were many brave heroes who helped their neighbors hide and stay safe. The memorial celebrates these everyday heroes who showed courage and kindness.",
        startTime: 120,
        endTime: 180,
      },
      {
        id: "kids-4",
        title: "A Message of Hope",
        content: "Today, the children of Rwanda play together, go to school together, and are building a peaceful future. The memorial reminds everyone that friendship and understanding can help create a better world.",
        startTime: 180,
        endTime: 240,
      },
    ],
  },
  summary: {
    duration: "1 min",
    description: "A quick overview of the memorial's significance.",
    segments: [
      {
        id: "sum-1",
        title: "Quick Overview",
        content: "The Kigali Genocide Memorial is Rwanda's principal site of remembrance for the 1994 genocide against the Tutsi. Located in Gisozi, it is the final resting place for over 250,000 victims and serves as an educational center promoting reconciliation. The memorial opened in 2004 on the tenth anniversary and includes burial grounds, memorial gardens, and exhibitions documenting Rwanda's history.",
        startTime: 0,
        endTime: 60,
      },
    ],
  },
};

// Mood modifiers adjust the tone and emphasis
const moodModifiers: Record<JourneyMood, { prefix: string; suffix: string }> = {
  emotional: {
    prefix: "",
    suffix: " Take a moment to reflect on the weight of these words.",
  },
  educational: {
    prefix: "Historical context: ",
    suffix: "",
  },
  fast: {
    prefix: "Key point: ",
    suffix: "",
  },
};

export function getStoryContentForPath(
  storyId: string,
  path: NarrativePath,
  mood: JourneyMood
): PathContent {
  // For now, we only have the KGM story
  const baseContent = kgmStoryContent[path];
  const modifier = moodModifiers[mood];

  // Apply mood modifiers to content
  const modifiedSegments = baseContent.segments.map((segment) => ({
    ...segment,
    content: mood === "fast" 
      ? segment.content.split('.').slice(0, 2).join('.') + '.'
      : modifier.prefix + segment.content + (mood === "emotional" ? modifier.suffix : ""),
  }));

  return {
    ...baseContent,
    segments: modifiedSegments,
  };
}

export function getPathDuration(path: NarrativePath): string {
  return kgmStoryContent[path].duration;
}

export function getPathDescription(path: NarrativePath): string {
  return kgmStoryContent[path].description;
}
