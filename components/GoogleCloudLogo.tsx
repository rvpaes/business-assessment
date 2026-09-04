// components/GoogleCloudLogo.tsx - Componente de Logo Oficial Google Cloud Seguro e Otimizado
"use client";

import React from "react";

interface GoogleCloudLogoProps {
  height?: number;
  className?: string;
  variant?: "standard" | "white_card";
}

export const GoogleCloudLogo: React.FC<GoogleCloudLogoProps> = ({
  height = 28,
  className = "",
  variant = "standard"
}) => {
  const logoSrc = "/images/google-cloud-logo.png";
  const fallbackSrc = "https://logos-world.net/wp-content/uploads/2021/02/Google-Cloud-Logo.png";

  const imgElement = (
    <img
      src={logoSrc}
      alt="Google Cloud"
      height={height}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
      style={{
        height: `${height}px`,
        maxHeight: `${height}px`,
        width: "auto",
        objectFit: "contain",
        display: "block"
      }}
      className={`shrink-0 select-none ${className}`}
    />
  );

  if (variant === "white_card") {
    return (
      <div 
        className="bg-white/95 px-2.5 py-1 rounded-lg flex items-center justify-center shadow-2xs shrink-0"
        style={{ height: `${height + 10}px` }}
      >
        {imgElement}
      </div>
    );
  }

  return imgElement;
};
