"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const AuroraBackground = ({ className, children }: AuroraBackgroundProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blob 1 — large red, slow drift */}
      <div className="dark:opacity-50 opacity-20" style={{
        position: "absolute", borderRadius: "50%",
        filter: "blur(90px)",
        width: 560, height: 560, top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, #ef4444, #b91c1c)",
        animation: "blob1 10s ease-in-out infinite, blobPulse 5s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0,
      }} />
      {/* Blob 2 — orange-red, offset left */}
      <div className="dark:opacity-45 opacity-15" style={{
        position: "absolute", borderRadius: "50%",
        filter: "blur(80px)",
        width: 420, height: 420, top: "40%", left: "30%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, #f97316, #ef4444)",
        animation: "blob2 13s ease-in-out infinite, blobPulse 7s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0,
      }} />
      {/* Blob 3 — deep red, offset right */}
      <div className="dark:opacity-40 opacity-15" style={{
        position: "absolute", borderRadius: "50%",
        filter: "blur(70px)",
        width: 380, height: 380, top: "60%", left: "65%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, #dc2626, #7f1d1d)",
        animation: "blob3 9s ease-in-out infinite, blobPulse 6s ease-in-out infinite 2s",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};
