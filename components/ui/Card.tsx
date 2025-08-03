"use client"

import type React from "react"
import { motion } from "framer-motion"
import { clsx } from "clsx"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: "default" | "glass" | "gradient" | "dark"
  glow?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  onClick,
  variant = "default",
  glow = false,
}) => {
  const variantClasses = {
    default: "bg-white border border-slate-200/60 shadow-lg",
    glass: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl",
    gradient: "bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 border border-indigo-100/50 shadow-xl",
    dark: "bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-2xl text-white",
  }

  const glowClasses = glow ? "shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20" : ""

  return (
    <motion.div
      className={clsx(
        "rounded-3xl transition-all duration-300",
        variantClasses[variant],
        hover && "cursor-pointer",
        glowClasses,
        className,
      )}
      whileHover={
        hover
          ? {
              y: -8,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }
          : {}
      }
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
