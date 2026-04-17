import { cn } from "@/lib/utils";

const YT_RED = "#FF0000";

type BrandLogoProps = {
  size?: number;
  className?: string;
};

/**
 * Logo: blank note / paper with transcript lines and a YouTube-style play tile on the page.
 */
export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 text-gray-300 dark:text-zinc-600",
        className,
      )}
      aria-hidden
    >
      {/* Paper */}
      <rect
        x="5"
        y="3.5"
        width="22"
        height="24"
        rx="3"
        className="fill-white dark:fill-zinc-900"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      {/* Transcript lines */}
      <line
        x1="8.25"
        y1="8.2"
        x2="18.25"
        y2="8.2"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity={0.95}
      />
      <line
        x1="8.25"
        y1="10.05"
        x2="14.75"
        y2="10.05"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity={0.75}
      />
      {/* YouTube-style play tile (centered on lower half of note) */}
      <g transform="translate(9, 12.25)">
        <rect width="14" height="10" rx="2.6" fill={YT_RED} />
        <path d="M5.65 2.85v4.3L9.3 5l-3.65-2.15Z" fill="white" />
      </g>
    </svg>
  );
}
