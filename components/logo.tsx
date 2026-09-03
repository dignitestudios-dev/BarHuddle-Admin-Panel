import * as React from "react"
import { ImageWithFallback, DUMMY_IMAGE } from "@/components/ui/image-with-fallback"

interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: number
  src?: string
}

export function Logo({ size = 128, className, ...props }: LogoProps) {
  return (
    <ImageWithFallback
      src={"/images/logo.png"}
      fallbackSrc={DUMMY_IMAGE}
      width={size}
      height={size}
      alt="logo"
      className={className}
      {...props}
    />
  )
}
