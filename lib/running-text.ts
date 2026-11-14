export interface RunningItem {
  id: string;
  icon: string;
  text: string;
  customIconUrl?: string;
  isActive: boolean;
}

export interface RunningTextConfig {
  enabled: boolean;
  speed: number; // in seconds, default 28
  theme: "light" | "dark" | "orange";
  separator: string; // e.g. "✦" or "//" or "•"
  items: RunningItem[];
}

export const DEFAULT_RUNNING_TEXT_CONFIG: RunningTextConfig = {
  enabled: true,
  speed: 28,
  theme: "light",
  separator: "✦",
  items: [
    { id: "1", icon: "canva", text: "Logo Canva | Canva", isActive: true },
    { id: "2", icon: "figma", text: "Logo Figma | Figma", isActive: true },
    { id: "3", icon: "nextjs", text: "Logo Next.JS | Next.JS", isActive: true },
    { id: "4", icon: "react", text: "Logo React | React", isActive: true },
    { id: "5", icon: "tailwind", text: "Logo Tailwind CSS | Tailwind CSS", isActive: true },
    { id: "6", icon: "typescript", text: "Logo TypeScript | TypeScript", isActive: true },
    { id: "7", icon: "nodejs", text: "Logo Node.JS | Node.JS", isActive: true },
    { id: "8", icon: "wordpress", text: "Logo WordPress | WordPress", isActive: true },
  ],
};
