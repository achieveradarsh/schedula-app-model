"use client"

import type React from "react"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  variant?: "default" | "gradient" | "pulse"
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  variant = "gradient",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const SpinnerVariant = () => {
    switch (variant) {
      case "gradient":
        return (
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="w-full h-full bg-white rounded-full"></div>
          </motion.div>
        )
      case "pulse":
        return (
          <motion.div
            className={`${sizeClasses[size]} bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full`}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        )
      default:
        return (
          <motion.div
            className={`${sizeClasses[size]} border-4 border-slate-200 border-t-indigo-600 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <SpinnerVariant />
      {text && (
        <motion.p
          className="text-slate-600 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
