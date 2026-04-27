-- Transcript cache table
-- Transcripts are immutable once published, so we cache them indefinitely.
CREATE TABLE IF NOT EXISTS public.transcripts (
  video_id text NOT NULL,
  lang     text NOT NULL DEFAULT 'en',
  segments jsonb NOT NULL,
  fetched_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  PRIMARY KEY (video_id, lang)
);

CREATE INDEX IF NOT EXISTS transcripts_video_id_idx ON public.transcripts(video_id);

ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transcripts are publicly readable"
  ON public.transcripts FOR SELECT USING (true);

CREATE POLICY "Transcripts can be inserted by anyone"
  ON public.transcripts FOR INSERT WITH CHECK (true);

CREATE POLICY "Transcripts can be updated by anyone"
  ON public.transcripts FOR UPDATE USING (true);
