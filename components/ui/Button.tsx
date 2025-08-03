"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "gradient"
  size?: "sm" | "md" | "lg" | "xl"
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  glow?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  glow = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 hover:from-slate-200 hover:to-slate-300 focus:ring-slate-500 shadow-md hover:shadow-lg",
    outline:
      "border-2 border-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 focus:ring-purple-500",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500 shadow-lg hover:shadow-xl",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
    gradient:
      "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 focus:ring-blue-500 shadow-lg hover:shadow-xl",
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  }

  const glowClasses = glow ? "shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40" : ""

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        glowClasses,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}
