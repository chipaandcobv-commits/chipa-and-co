import React from "react";

interface ClickableTextProps {
  text: string;
  className?: string;
}

export default function ClickableText({ text, className = "" }: ClickableTextProps) {
  // Función para detectar URLs y convertirlas en enlaces clickeables
  const makeTextClickable = (text: string) => {
    // Regex para detectar URLs (http, https, ftp, etc.)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F15A25] hover:text-[#E55A1A] underline transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // Copiar al portapapeles si es necesario
              if (navigator.clipboard) {
                navigator.clipboard.writeText(part);
              }
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <span className={className}>
      {makeTextClickable(text)}
    </span>
  );
}
