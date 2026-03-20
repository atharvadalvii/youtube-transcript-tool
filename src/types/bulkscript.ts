export type UrlType = 'VIDEO' | 'PLAYLIST' | 'CHANNEL' | null;
export type JobStatus = 'pending' | 'processing' | 'done' | 'failed';
export type ExportFormat = 'TXT' | 'SRT' | 'JSON' | 'CSV';

export interface TranscriptSegment {
  timestamp: string;
  startSeconds: number;
  text: string;
  speaker?: string;
}

export interface TranscriptJob {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  duration?: string;
  status: JobStatus;
  progress: number;
  transcript: TranscriptSegment[];
  wordCount: number;
  errorMessage?: string;
  sourceUrl: string;
}

export interface ExtractorSettings {
  language: string;
  includeTimestamps: boolean;
  speakerDetection: boolean;
  rateLimitMs: number;
}

export interface BulkScriptState {
  jobs: TranscriptJob[];
  selectedJobId: string | null;
  exportFormat: ExportFormat;
  searchQuery: string;
  globalSearch: string;
  settings: ExtractorSettings;
  settingsOpen: boolean;
  urlInput: string;
  urlType: UrlType;
  detectedInfo: DetectedInfo | null;
  isDetecting: boolean;
  videoList: VideoListItem[];
  selectedVideoIds: Set<string>;
  showVideoList: boolean;
}

export interface DetectedInfo {
  title: string;
  thumbnailUrl?: string;
  videoCount?: number;
  channelName?: string;
  description?: string;
}

export interface VideoListItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration?: string;
  channelName?: string;
}
