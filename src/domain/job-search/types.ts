export interface ScannerSettings {
  scrollDelayMs: number;
  activeProfileId: string;
  profiles: ScanProfile[];
}

export interface ScanProfile {
  id: string;
  name: string;
  primaryKeywords: string[];
  supportingKeywords: string[];
  locationKeywords: string[];
  hiringKeywords: string[];
  exclusionKeywords: string[];
}

export interface LinkedInPost {
  id: string;
  text: string;
  rawText: string;
  html: string;
  author: string;
  authorProfileUrl: string;
  authorHeadline: string;
  authorImageUrl: string;
  connectionDegree: string;
  timestamp: string;
  url: string;
  hashtags: string[];
  links: LinkedInPostLink[];
  externalLinks: LinkedInPostLink[];
  media: LinkedInPostMedia[];
  preview: LinkedInPostPreview | null;
  engagement: LinkedInPostEngagement;
  foundAt: number;
}

export interface LinkedInPostLink {
  text: string;
  url: string;
  resolvedUrl: string;
  hostname: string;
  isExternal: boolean;
  isProfile: boolean;
  isHashtag: boolean;
}

export interface LinkedInPostMedia {
  src: string;
  alt: string;
}

export interface LinkedInPostPreview {
  title: string;
  url: string;
  resolvedUrl: string;
  hostname: string;
  imageUrl: string;
}

export interface LinkedInPostEngagement {
  reactions: number;
  comments: number;
  reposts: number;
}

export type ScanStatus = "running" | "stopped" | "complete" | "error";

export interface ScanRecord {
  id: string;
  status: ScanStatus;
  sourceUrl: string;
  sourceTabId: number;
  startedAt: number;
  updatedAt: number;
  postCount: number;
  seenCount: number;
  lastActivity: string;
  profile: ScanProfile;
  error: string;
}

export interface ScanData {
  scan: ScanRecord | null;
  posts: LinkedInPost[];
}
