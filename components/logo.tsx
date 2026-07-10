import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 128, className, ...props }: LogoProps) {
  return (
    <img src={"/images/logo.png"} width={size} height={size} alt="logo" />
  )
}
