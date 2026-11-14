import React from "react";

interface TechIconProps {
  name: string;
  className?: string;
  customIconUrl?: string;
}

export default function TechIcon({ name, className = "w-5 h-5", customIconUrl }: TechIconProps) {
  if (customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt={name}
        className={`${className} object-contain inline-block shrink-0`}
      />
    );
  }

  const key = (name || "").toLowerCase().trim();

  switch (key) {
    case "canva":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <defs>
            <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4CC" />
              <stop offset="100%" stopColor="#7D2AE8" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#canva-grad)" />
          <path
            d="M15 14.8c-.8.6-1.8.9-2.8.9-2.5 0-3.9-1.6-3.9-4 0-2.9 2-4.8 4.7-4.8 1.2 0 2.1.4 2.5.7l-.7 1.3c-.4-.3-1-.5-1.8-.5-1.7 0-2.9 1.2-2.9 3.2 0 1.7.9 2.7 2.5 2.7.6 0 1.2-.2 1.7-.5l.7 1z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="0.4"
          />
        </svg>
      );

    case "figma":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <path d="M7 2h5v5H7a2.5 2.5 0 0 1 0-5z" fill="#F24E1E" />
          <path d="M12 2h5a2.5 2.5 0 0 1 0 5h-5V2z" fill="#FF7262" />
          <path d="M7 7h5v5H7a2.5 2.5 0 0 1 0-5z" fill="#A259FF" />
          <path d="M14.5 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="#1ABCFE" />
          <path d="M7 12h5v5a2.5 2.5 0 1 1-5 0v-5z" fill="#0ACF83" />
        </svg>
      );

    case "nextjs":
    case "next.js":
    case "next":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#2D2D2D]`}>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            d="M15.5 16.5l-5.6-7.3v7.3H8.5V7.5h1.5l5.8 7.5V7.5h1.4v9h-1.7z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "react":
    case "reactjs":
    case "react.js":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0 text-[#61DAFB]`}>
          <ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="currentColor" strokeWidth="1.5" />
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.8"
            stroke="currentColor"
            strokeWidth="1.5"
            transform="rotate(60 12 12)"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.8"
            stroke="currentColor"
            strokeWidth="1.5"
            transform="rotate(120 12 12)"
          />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );

    case "tailwind":
    case "tailwindcss":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <path
            d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z"
            fill="#38BDF8"
          />
        </svg>
      );

    case "typescript":
    case "ts":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path
            d="M5.5 10.5h5v1.8H8.8v6.2H7.2v-6.2H5.5v-1.8zm8.9 4.8c.6.4 1.3.7 2 .7.8 0 1.2-.3 1.2-.8 0-.5-.4-.7-1.4-1.1-1.4-.5-2.2-1.1-2.2-2.3 0-1.3 1-2.2 2.6-2.2 1 0 1.7.3 2.3.6l-.5 1.6c-.5-.3-1.1-.5-1.8-.5-.7 0-1.1.3-1.1.7 0 .5.4.7 1.4 1.1 1.5.5 2.2 1.2 2.2 2.4 0 1.4-1.1 2.3-2.8 2.3-1.1 0-2-.3-2.6-.8l.7-1.6z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "javascript":
    case "js":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <path
            d="M12.5 15.5c.3.5.8.8 1.4.8.7 0 1.1-.3 1.1-.8 0-.5-.4-.8-1.2-1.1l-.4-.2c-1.2-.5-2-1.1-2-2.3 0-1.3 1-2.2 2.5-2.2 1.1 0 1.8.4 2.3 1.2l-1.1.8c-.3-.5-.6-.7-1.2-.7-.5 0-.9.3-.9.7 0 .4.3.7 1 .9l.4.2c1.4.5 2.2 1.1 2.2 2.4 0 1.5-1.1 2.4-2.7 2.4-1.4 0-2.3-.6-2.8-1.5l1.4-.7zm-5.7.2c.2.4.5.6 1 .6.5 0 .9-.2.9-.9v-5.6h1.5v5.6c0 1.6-.9 2.3-2.4 2.3-1.1 0-1.9-.5-2.3-1.3l1.3-.7z"
            fill="#000000"
          />
        </svg>
      );

    case "nodejs":
    case "node.js":
    case "node":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#5FA04E]`}>
          <path d="M12 2.5l8.5 4.9v9.8L12 22l-8.5-4.8V7.4L12 2.5zm0 2.3L5.5 8.5v7l6.5 3.7 6.5-3.7v-7L12 4.8zm-1.8 4.7h3.6v1.8h-1.8v5h-1.8v-6.8z" />
        </svg>
      );

    case "wordpress":
    case "wp":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#21759B]`}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.96 16.59L7.26 8.35c.44-.02.86-.06.86-.06.4-.04.36-.64-.04-.64 0 0-1.22.1-2.02.1-.2 0-.64-.02-1.02-.04C6.55 5.25 9.07 3.6 12 3.6c2.51 0 4.77 1.21 6.2 3.09-.07 0-.13.01-.2.01-.8 0-1.37.7-1.37 1.45 0 .68.4 1.25.82 1.93.33.55.72 1.25.72 2.26 0 .71-.19 1.53-.54 2.58l-2.65 7.91-2.98-8.9c.4-.02.77-.05.77-.05.4-.04.36-.64-.04-.64 0 0-1.22.1-2.02.1-.8 0-2.02-.1-2.02-.1-.4 0-.44.6-.04.64 0 0 .41.03.8.05l2.38 7.09z" />
        </svg>
      );

    case "laravel":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#FF2D20]`}>
          <path d="M21.5 5.8l-7.7-4.4c-.5-.3-1.1-.3-1.6 0L4.5 5.8c-.5.3-.8.8-.8 1.4v8.8c0 .6.3 1.1.8 1.4l7.7 4.4c.5.3 1.1.3 1.6 0l7.7-4.4c.5-.3.8-.8.8-1.4V7.2c0-.6-.3-1.1-.8-1.4zm-9 13.3l-6-3.4V9.6l6 3.4v6.1zm1.5-7.7L8 8l6-3.4 6 3.4-6 3.4zm6 4.3l-6 3.4V13l6-3.4v6.1z" />
        </svg>
      );

    case "php":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="4" fill="#777BB4" />
          <path
            d="M5 15V9h2.8c1.3 0 2.2.8 2.2 2s-.9 2-2.2 2H6.6v2H5zm1.6-3.4h1.1c.5 0 .9-.3.9-.7s-.4-.7-.9-.7H6.6v1.4zm5 3.4V9h1.6v2.2h2V9h1.6v6h-1.6v-2.4h-2V15h-1.6zm6.8 0V9h2.8c1.3 0 2.2.8 2.2 2s-.9 2-2.2 2h-1.2v2h-1.6zm1.6-3.4h1.1c.5 0 .9-.3.9-.7s-.4-.7-.9-.7h-1.1v1.4z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "python":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <path
            d="M11.9 2c-3.1 0-2.9 1.3-2.9 1.3v1.4h5.9v.9H6.3S4 5.3 4 8.5c0 3.1 1.9 3.1 1.9 3.1h1.1v-1.6c0-1.7 1.4-3.1 3.1-3.1h5.8c1.7 0 2.6-.9 2.6-2.6V4.6S18.7 2 11.9 2zm-1.8 1.4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c3.1 0 2.9-1.3 2.9-1.3v-1.4H9.1v-.9h8.6s2.3.3 2.3-2.9c0-3.1-1.9-3.1-1.9-3.1h-1.1v1.6c0 1.7-1.4 3.1-3.1 3.1H8.1c-1.7 0-2.6.9-2.6 2.6v2.7s-.2 2.6 6.6 2.6zm1.8-1.4c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"
            fill="#FFD43B"
          />
        </svg>
      );

    case "docker":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#2496ED]`}>
          <path d="M22.5 10.5c-.3-.2-1.7-.5-2.7.2-.2-.6-.7-1.1-1.3-1.4l-.5-.2-.3.4c-.7 1.1-.6 2.4-.2 3.3-1.1.6-3.1.6-4.5.6H2.6c-.4 1.9.4 3.8 1.8 4.9C6.4 19.8 10 20 12.3 20c6.4 0 10.7-3.9 10.8-8.8 0-.2 0-.5-.1-.7h-.5zM8.8 7.3H6.6v2h2.2v-2zm3.3 0H9.9v2h2.2v-2zm3.3 0h-2.2v2h2.2v-2zm-6.6-3H6.6v2h2.2v-2zm3.3 0H9.9v2h2.2v-2zm3.3 0h-2.2v2h2.2v-2z" />
        </svg>
      );

    case "mysql":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="4" fill="#00758F" />
          <path
            d="M6 14.5c.5-.8 1.4-1.3 2.5-1.3 1.3 0 2.2.8 2.5 2h-1c-.3-.7-.8-1.1-1.5-1.1-.7 0-1.3.3-1.6.8l1.6 1.8c.2.2.4.3.7.3.5 0 .9-.3 1-.8h1c-.2 1-1 1.7-2 1.7-1.1 0-2-.5-2.5-1.4l-.2-2zm7.5-1.3h1.8l1.7 3.5 1.7-3.5h1.8v5h-1v-3.7l-1.8 3.7h-1.4l-1.8-3.7V18.2h-1v-5z"
            fill="#F29111"
          />
        </svg>
      );

    case "photoshop":
    case "ps":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="5" fill="#001E36" />
          <path
            d="M6.5 16.5v-9h3.6c2 0 3.3 1.1 3.3 2.7 0 1.8-1.4 2.8-3.3 2.8H8.3v3.5H6.5zm1.8-5h1.7c1 0 1.6-.5 1.6-1.3 0-.8-.6-1.2-1.6-1.2H8.3v2.5zm6.8 5c.8.3 1.6.5 2.5.5 1.7 0 2.6-.7 2.6-1.8 0-1-.7-1.5-2.2-1.9-1.2-.3-1.5-.6-1.5-1.1 0-.6.5-1 1.4-1 .8 0 1.5.2 2.1.5l.5-1.3c-.6-.3-1.4-.5-2.3-.5-1.7 0-2.6.8-2.6 1.8 0 1 .8 1.5 2.2 1.8 1.2.3 1.5.7 1.5 1.2 0 .6-.6 1.1-1.6 1.1-.9 0-1.8-.3-2.3-.6l-.3 1.2z"
            fill="#31A8FF"
          />
        </svg>
      );

    case "illustrator":
    case "ai":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`}>
          <rect width="24" height="24" rx="5" fill="#330000" />
          <path
            d="M6.5 16.5l3.2-9h1.7l3.2 9h-1.9l-.7-2.1H8.8l-.7 2.1H6.5zm2.8-3.6h2.2l-1.1-3.4-1.1 3.4zm7.5 3.6v-6.3h1.7v6.3h-1.7zm0-7.7V7.2h1.7v1.6h-1.7z"
            fill="#FF9A00"
          />
        </svg>
      );

    case "git":
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} shrink-0 text-[#2D2D2D]`}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );

    case "arvanta":
    case "arvantastudio":
      return (
        <span className="inline-flex items-center justify-center font-bold text-xs font-bebas px-1.5 py-0.5 bg-[#2D2D2D] text-[#FF9857] rounded-sm shrink-0">
          ARVANTA
        </span>
      );

    default:
      // Default clean badge or generic tech chip
      return (
        <span className="w-5 h-5 rounded-md bg-[#2D2D2D] text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
          {(name || "T")[0].toUpperCase()}
        </span>
      );
  }
}
