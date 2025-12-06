export const BubbleType = {
  PERSON: 'PERSON',
  EVENT: 'EVENT',
  PET: 'PET'
} as const;

export type BubbleType = typeof BubbleType[keyof typeof BubbleType];

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  images?: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }>;
}

export interface BubbleData {
  id: string;
  name: string;
  type: BubbleType;
  mainImage: string;
  birthDate?: string;
  deathDate?: string;
  shortBio: string;
  fullBio: string;
  position: [number, number, number];
  size: number;
  timeline: TimelineEvent[];
  gallery: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    date: string;
  }>;
}

export interface AppState {
  view: 'OCEAN' | 'MEMORIAL';
  selectedBubbleId: string | null;
  isAddModalOpen: boolean;
}