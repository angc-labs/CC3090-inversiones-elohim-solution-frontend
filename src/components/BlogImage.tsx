"use client";

import Image, { type ImageProps } from "next/image";

export function BlogImage({ src, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      src={src}
      onError={(event) => {
        event.currentTarget.src = "/placeholder.png";
      }}
    />
  );
}