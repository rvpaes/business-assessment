// components/GoogleCloudLogo.tsx - Componente de Logo Oficial Google Cloud Seguro e Otimizado
"use client";

import React from "react";

interface GoogleCloudLogoProps {
  height?: number;
  className?: string;
  variant?: "standard" | "white_card";
}

// Logo oficial Google Cloud otimizado e recortado em base64 ultra-leve (1.2KB)
// Garante renderização 100% imediata, offline e imune a erros de rede ou 404
const GOOGLE_CLOUD_LOGO_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAX0AAAA8BAMAAAB4JHcfAAAAGFBMVEVHcExiZ3F2a2NfY2hChfT7vAXqQzU0qFM9AFjpAAAAA3RSTlMATKUABpOwAAAEeElEQVR4nNWazW7bMAyA6WrJOUAG7BqgQ89u9AId4AfoBgi9rsOgJyiQ1x/0T0qibdnxUPPiUnblTxRFUnIAqDxprTXsVZ4M/X5HoJOcYNf4eocD0FRgZ3LM+P/AruQhw9f6N+xJdCF/Ycfeo7UeXvjHhZTw2c0/DNzDQlqBz+z9ehi4CXD0UsrWGHvebMzHmvmZCfDWXzAD2/HrKO9+LAPHj/Dl8/34O9PfBVa6z7tVj978VQdC+FL29+I/4/7mTtNjeP+R4Bt94Pit+a9mzPfkF8QgzfxFzfDd8VccCFE3LwCWX9AZXcqPMi7HL7DRG83P80vXqx3GAv5Oa62UUujWF8aBzCuSAvfhF7FTN45W/qOlV0r9TPcY/mafn8MvY7vL6838Hl+pXxMORMx/L36BbCKW+P8h8qvXzIHKVzXG/Hn8QKSRH+ErdRpdAOc17sPxy7zPRn6MnxZx1YHWVW3b8B8o/yvlf5nFH5Ja0tJzVhFXeYn8NPOJos/QYJJyndytQ8evRvnpBDAd0mrIaVei2TXq+V22SkuW40c1YnhcuKvrAc5z+PEEdHX3D+mzH9ESf2iB+N95n3iY7u+M33dotcx9cv8nE4AjXWH+ZKuqFvnz2k8y/LSiwPy+2JNWY8w/wd8hSmxiXgv8qQVG+Z2L+4RD+UOWthfG/In/ZYo/Vi3jF8RPErms8/sBulcSfk9hEHp4SODE/NUFUOUPOdkU1ChDE00k/jQx/Rj/Q9oM5PzhDbaL4P6mgZZw8LVwII4/vEn2SbOpjt4L/GFEMMIfo5L9I+PvC37bcMDmr6WwLgZJyn9K/UXiimb4fUsolYHn73n++BzlB2L+Wg2Ux3+j05XIaBm/D+Aj/Dg+Uf6UL0xrFnVW8rMa5j/hzAQr+B8n+MtNQH7oM5sfEL/DT7u4Sf4Lw2+0LGpO8OcJzPnItY2f4oMoSvKcv78nP3YgO5xm+0s6i6Ja/2xm/2X82P+zRSQm+eFu/Nn+N6TfqD7PiT/ldqvfJv5U+On5g1XOS+I/xZVJ6Ufjv634V8RPYj5/FrQs/7qderl/l6P5lxQTXZG/Mqnt4Q2/jxd+KGFKuqb6B3uNTBMQz39iVrct53oxlPirJ7+1HZhbfyd0ELqs/sSOKGIIdjtGXDLHfF0ozhK4fqubv9zC45oeWuv/VDlJ0me4Bgf3Rx1xtL2rcH3xYdcCrp9vxceUcIabHaGg9yc/xEBz91+SbOGDGN+ME5QeI/8ky/3X2y3IR9y41Pkr31+W7X9ldVKdhtvwAy4q+R6eEf+N5y/8qgSgek0rzx+KQhDDojZsBrdjD3dcjD1Q88/g9w5zrUel6mlQiv8RJusTjyldk5O5CBaygrlz8Ro1f8E/8hW4QZiTixbB9sJCzV/ww2fh5+RAzJ/z/4B10m3/wV69jfCv/B0QcljYSg43nn+l98fvBZv+3OAbz7+2a/9RekP3N8Lyr/4VmQuK5KvlFnKr86//EVxx2rmRdBX+taHHSlns7EvEfzH/hhI3DHsVsaX1/wGCV+g1CeP8xQAAAABJRU5ErkJggg==";

export const GoogleCloudLogo: React.FC<GoogleCloudLogoProps> = ({
  height = 28,
  className = "",
  variant = "standard"
}) => {
  const imgElement = (
    <img
      src={GOOGLE_CLOUD_LOGO_BASE64}
      alt="Google Cloud"
      height={height}
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
