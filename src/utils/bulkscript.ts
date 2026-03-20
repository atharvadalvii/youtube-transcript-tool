import { UrlType, DetectedInfo, VideoListItem, TranscriptSegment, ExportFormat } from '@/types/bulkscript';

export function detectUrlType(url: string): UrlType {
  if (!url.trim()) return null;
  try {
    const u = new URL(url);
    const hostname = u.hostname.replace('www.', '');
    if (!['youtube.com', 'youtu.be'].includes(hostname)) return null;

    if (hostname === 'youtu.be') return 'VIDEO';

    const pathname = u.pathname;
    if (u.searchParams.get('list')) return 'PLAYLIST';
    if (pathname.startsWith('/watch') && u.searchParams.get('v')) return 'VIDEO';
    if (pathname.startsWith('/playlist')) return 'PLAYLIST';
    if (pathname.startsWith('/channel') || pathname.startsWith('/c/') || pathname.startsWith('/@')) return 'CHANNEL';
    if (pathname.startsWith('/user/')) return 'CHANNEL';
    // Short URLs
    if (pathname.length > 1 && !pathname.includes('/')) return 'VIDEO';
    return null;
  } catch {
    return null;
  }
}

export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const hostname = u.hostname.replace('www.', '');
    if (hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    return null;
  } catch {
    return null;
  }
}

export function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get('list');
  } catch {
    return null;
  }
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function countWords(segments: TranscriptSegment[]): number {
  return segments.reduce((acc, seg) => acc + seg.text.split(/\s+/).filter(Boolean).length, 0);
}

// Mock data generators for demo purposes
export function generateMockTranscript(videoId: string): TranscriptSegment[] {
  const samples = [
    "Welcome to this video. Today we're going to explore an incredibly fascinating topic.",
    "First, let's understand the basics of what we're dealing with here.",
    "The key insight is that everything connects back to the fundamental principles.",
    "Now let's dive deeper into the technical aspects of this subject.",
    "As you can see from this example, the pattern becomes quite clear.",
    "Many experts in the field have debated this for years without resolution.",
    "The data shows a clear trend toward more efficient solutions over time.",
    "Here's where things get really interesting from a technical standpoint.",
    "Let me show you a practical example that demonstrates this concept.",
    "The implications of this discovery are profound and far-reaching.",
    "We need to consider the broader context when analyzing these results.",
    "This approach has been validated across multiple research studies.",
    "The implementation details are crucial to getting this right.",
    "In conclusion, we've covered the most important aspects of this topic.",
    "Thank you for watching and don't forget to subscribe for more content.",
  ];

  return samples.map((text, i) => ({
    timestamp: formatTimestamp(i * 45),
    startSeconds: i * 45,
    text,
    speaker: i % 5 === 0 ? 'Speaker A' : i % 5 === 2 ? 'Speaker B' : undefined,
  }));
}

export function generateMockVideoList(count: number, prefix: string = 'Video'): VideoListItem[] {
  const titles = [
    'Introduction to Machine Learning',
    'Deep Dive: Neural Networks Explained',
    'Building Your First AI Model',
    'Data Preprocessing Best Practices',
    'The Future of Artificial Intelligence',
    'Reinforcement Learning Fundamentals',
    'Natural Language Processing Overview',
    'Computer Vision Techniques',
    'Transfer Learning in Practice',
    'Ethics in AI Development',
    'Scaling ML Systems to Production',
    'Feature Engineering for Better Models',
    'Hyperparameter Tuning Strategies',
    'Model Deployment and MLOps',
    'Real-World AI Case Studies',
  ];

  return Array.from({ length: Math.min(count, titles.length) }, (_, i) => ({
    id: `vid_${Date.now()}_${i}`,
    title: `${prefix}: ${titles[i % titles.length]}`,
    thumbnailUrl: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
    duration: `${Math.floor(Math.random() * 30 + 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    channelName: prefix,
  }));
}

export function formatTranscript(
  segments: TranscriptSegment[],
  format: ExportFormat,
  includeTimestamps: boolean,
  title: string
): string {
  switch (format) {
    case 'TXT':
      if (includeTimestamps) {
        return segments.map(s => `[${s.timestamp}] ${s.speaker ? `${s.speaker}: ` : ''}${s.text}`).join('\n');
      }
      return segments.map(s => `${s.speaker ? `${s.speaker}: ` : ''}${s.text}`).join('\n');

    case 'SRT':
      return segments.map((s, i) => {
        const start = formatSrtTime(s.startSeconds);
        const end = formatSrtTime(s.startSeconds + 5);
        return `${i + 1}\n${start} --> ${end}\n${s.text}\n`;
      }).join('\n');

    case 'JSON':
      return JSON.stringify({
        title,
        segments: segments.map(s => ({
          timestamp: s.timestamp,
          startSeconds: s.startSeconds,
          text: s.text,
          ...(s.speaker ? { speaker: s.speaker } : {}),
        })),
      }, null, 2);

    case 'CSV':
      const headers = ['Timestamp', 'Start Seconds', 'Speaker', 'Text'];
      const rows = segments.map(s => [
        `"${s.timestamp}"`,
        s.startSeconds,
        `"${s.speaker || ''}"`,
        `"${s.text.replace(/"/g, '""')}"`,
      ].join(','));
      return [headers.join(','), ...rows].join('\n');

    default:
      return segments.map(s => s.text).join('\n');
  }
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getMimeType(format: ExportFormat): string {
  const map: Record<ExportFormat, string> = {
    TXT: 'text/plain',
    SRT: 'text/plain',
    JSON: 'application/json',
    CSV: 'text/csv',
  };
  return map[format];
}
