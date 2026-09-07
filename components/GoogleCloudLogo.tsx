// components/GoogleCloudLogo.tsx - Componente de Logo Oficial Google Cloud Seguro e Otimizado
"use client";

import React from "react";

export interface GoogleCloudIconProps {
  size?: number;
  className?: string;
}

/**
 * Ícone oficial Google Cloud (4 cores: Vermelho, Azul, Verde, Amarelo).
 * Baseado no padrão vetorial oficial (SVG) e compatível com https://icons8.com.br/icon/WHRLQdbEXQ16/google-cloud.
 */
export const GoogleCloudIcon: React.FC<GoogleCloudIconProps> = ({
  size = 22,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`shrink-0 select-none inline-block ${className}`}
      aria-label="Google Cloud"
    >
      {/* Arco Superior Vermelho */}
      <path
        fill="#ea4535"
        d="M80.6 40.3h.4l-.2-.2 14-14v-.3c-11.8-10.4-28.1-14-43.2-9.5C36.5 20.8 24.9 32.8 20.7 48c.2-.1.5-.2.8-.2 5.2-3.4 11.4-5.4 17.9-5.4 2.2 0 4.3.2 6.4.6.1-.1.2-.1.3-.1 9-9.9 24.2-11.1 34.6-2.6h-.1z"
      />
      {/* Corpo Direito Azul */}
      <path
        fill="#4285f4"
        d="M108.1 47.8c-2.3-8.5-7.1-16.2-13.8-22.1L80 39.9c6 4.9 9.5 12.3 9.3 20v2.5c16.9 0 16.9 25.2 0 25.2H63.9v20h-.1l.1.2h25.4c14.6.1 27.5-9.3 31.8-23.1 4.3-13.8-1-28.8-13-36.9z"
      />
      {/* Base Inferior Verde */}
      <path
        fill="#34a853"
        d="M39 107.9h26.3V87.7H39c-1.9 0-3.7-.4-5.4-1.1l-15.2 14.6v.2c6 4.3 13.2 6.6 20.7 6.6z"
      />
      {/* Curvatura Esquerda Amarela */}
      <path
        fill="#fbbc05"
        d="M40.2 41.9c-14.9.1-28.1 9.3-32.9 22.8-4.8 13.6 0 28.5 11.8 37.3l15.6-14.9c-8.6-3.7-10.6-14.5-4-20.8 6.6-6.4 17.8-4.4 21.7 3.8L68 55.2C61.4 46.9 51.1 42 40.2 42.1z"
      />
    </svg>
  );
};

export interface GoogleCloudWordmarkProps {
  height?: number;
  textColor?: "dark" | "white";
  className?: string;
}

/**
 * Wordmark oficial Google Cloud extraído do padrão Litmus (lockup_GoogleCloud_FullColor_rgb_544x96px.svg).
 * Renderização vetorial pura em SVG (sem fontes externas necessárias, 100% nítido em qualquer resolução).
 */
export const GoogleCloudWordmark: React.FC<GoogleCloudWordmarkProps> = ({
  height = 20,
  textColor = "dark",
  className = "",
}) => {
  const width = Math.round(height * (543.55 / 96));
  const cloudFill = textColor === "white" ? "#FFFFFF" : "#5f6368";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 543.55 96"
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`shrink-0 select-none inline-block ${className}`}
      aria-label="Google Cloud"
    >
      <g>
        {/* Word: Cloud */}
        <path
          d="M354,74.49q-14.64,0-24.47-9.84t-9.76-24.56q0-14.73,9.76-24.48Q339.29,5.68,354,5.68q14.89,0,24.19,10.76l-6.07,5.89A22.49,22.49,0,0,0,354,13.77a24.89,24.89,0,0,0-18.31,7.36q-7.27,7.28-7.27,19T335.7,59A24.85,24.85,0,0,0,354,66.4q11.49,0,20-9.66l6.16,6a31.83,31.83,0,0,1-11.5,8.69A34.91,34.91,0,0,1,354,74.49ZM394.14,7.15V73h-8.47V7.15Zm6.11,43.33q0-10.4,6.54-17.2a22.24,22.24,0,0,1,16.65-6.81A22,22,0,0,1,440,33.28q6.62,6.81,6.62,17.2T440,67.69a22,22,0,0,1-16.56,6.8,22.23,22.23,0,0,1-16.65-6.8Q400.25,60.88,400.25,50.48Zm8.47,0q0,7.27,4.23,11.78a14.45,14.45,0,0,0,21,0q4.23-4.51,4.23-11.78T433.93,38.8a14.26,14.26,0,0,0-21,0Q408.72,43.3,408.72,50.48ZM492.23,73h-8.1V66.77h-.37a15.15,15.15,0,0,1-5.93,5.52,17,17,0,0,1-8.33,2.2q-8.28,0-12.74-4.73T452.3,56.28V27.94h8.46V55.73q.28,11,11.13,11a10.59,10.59,0,0,0,8.47-4.1,14.82,14.82,0,0,0,3.4-9.8V27.94h8.47Zm27.49,1.47a19.84,19.84,0,0,1-15.18-7,24.82,24.82,0,0,1-6.25-17,24.85,24.85,0,0,1,6.25-17,19.84,19.84,0,0,1,15.18-7,19.46,19.46,0,0,1,9.07,2.12,15.89,15.89,0,0,1,6.3,5.61h.37l-.37-6.26V7.15h8.46V73h-8.09V66.77h-.37a15.89,15.89,0,0,1-6.3,5.61A19.46,19.46,0,0,1,519.72,74.49Zm1.38-7.72a13,13,0,0,0,10.22-4.51q4.14-4.51,4.14-11.78a16.81,16.81,0,0,0-4.14-11.68,13,13,0,0,0-10.22-4.6,13.2,13.2,0,0,0-10.21,4.6,16.81,16.81,0,0,0-4.14,11.68q0,7.19,4.14,11.69A13.23,13.23,0,0,0,521.1,66.77Z"
          fill={cloudFill}
        />
        {/* Letter G (Blue) */}
        <path
          d="M37.76,74.48C17.24,74.48,0,57.76,0,37.24S17.24,0,37.76,0a35.45,35.45,0,0,1,25.5,10.26l-7.17,7.18a25.91,25.91,0,0,0-18.33-7.27A26.7,26.7,0,0,0,11.07,37.24,26.7,26.7,0,0,0,37.76,64.3c9.71,0,15.24-3.9,18.78-7.44,2.91-2.91,4.81-7.09,5.54-12.81H37.49V33.88H72a32.5,32.5,0,0,1,.55,6.35c0,7.63-2.09,17.08-8.81,23.8C57.18,70.84,48.83,74.48,37.76,74.48Z"
          fill="#4285f4"
        />
        {/* Letter o (Red) */}
        <path
          d="M124.16,50.5a24,24,0,0,1-48,0,24,24,0,0,1,48.05,0Zm-10.52,0c0-8.63-6.25-14.53-13.5-14.53S86.63,41.87,86.63,50.5,92.89,65,100.14,65,113.64,59,113.64,50.5Z"
          fill="#ea4335"
        />
        {/* Letter o (Yellow) */}
        <path
          d="M176.45,50.5a24,24,0,0,1-48,0,24,24,0,0,1,48,0Zm-10.52,0c0-8.63-6.25-14.53-13.5-14.53s-13.51,5.9-13.51,14.53S145.17,65,152.43,65,165.93,59,165.93,50.5Z"
          fill="#fbbc04"
        />
        {/* Letter g (Blue) */}
        <path
          d="M226.47,28V71c0,17.71-10.44,25-22.78,25a22.83,22.83,0,0,1-21.24-14.17L191.62,78c1.63,3.9,5.62,8.53,12.07,8.53,7.89,0,12.8-4.9,12.8-14.07V69h-.37a16.35,16.35,0,0,1-12.61,5.45c-12,0-23-10.45-23-23.89s11-24.07,23-24.07a16.58,16.58,0,0,1,12.61,5.36h.37V28Zm-9.26,22.62c0-8.45-5.63-14.62-12.8-14.62s-13.34,6.17-13.34,14.62S197.15,65,204.41,65,217.21,58.94,217.21,50.59Z"
          fill="#4285f4"
        />
        {/* Letter l (Green) */}
        <path
          d="M244.57,2.54V73H234V2.54Z"
          fill="#34a853"
        />
        {/* Letter e (Red) */}
        <path
          d="M285.38,58.4l8.17,5.45a23.87,23.87,0,0,1-20,10.63c-13.61,0-23.78-10.54-23.78-24,0-14.26,10.26-24,22.6-24s18.51,9.9,20.51,15.26L294,44.5,262,57.76c2.45,4.82,6.26,7.27,11.62,7.27S282.66,62.4,285.38,58.4Zm-25.14-8.63,21.42-8.9c-1.18-3-4.72-5.09-8.9-5.09A13.15,13.15,0,0,0,260.24,49.77Z"
          fill="#ea4335"
        />
      </g>
    </svg>
  );
};

export interface GoogleCloudLogoProps {
  height?: number;
  className?: string;
  variant?: "standard" | "white_card";
  textColor?: "dark" | "white";
  showText?: boolean;
  showIcon?: boolean;
}

export const GoogleCloudLogo: React.FC<GoogleCloudLogoProps> = ({
  height = 24,
  className = "",
  variant = "standard",
  textColor = "dark",
  showText = true,
  showIcon = false,
}) => {
  const iconSize = Math.max(16, Math.round(height * 0.9));
  const wordmarkHeight = showIcon ? Math.max(12, Math.round(height * 0.75)) : height;

  const content = (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {showIcon && <GoogleCloudIcon size={iconSize} />}
      {showText && (
        <GoogleCloudWordmark
          height={wordmarkHeight}
          textColor={textColor}
        />
      )}
    </div>
  );

  if (variant === "white_card") {
    return (
      <div
        className="bg-white/95 px-2.5 py-1 rounded-lg flex items-center justify-center shadow-2xs shrink-0 border border-slate-200/50"
        style={{ height: `${height + 10}px` }}
      >
        {content}
      </div>
    );
  }

  return content;
};
