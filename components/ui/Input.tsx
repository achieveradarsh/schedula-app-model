"use client"

import type React from "react"
import { forwardRef } from "react"
import { clsx } from "clsx"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helperText?: string
  variant?: "default" | "glass" | "gradient"
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  helperText,
  variant = "default",
  className = "",
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20",
    glass: "bg-white/80 backdrop-blur-xl border-white/30 focus:border-indigo-400 focus:ring-indigo-400/20",
    gradient:
      "bg-gradient-to-r from-white to-indigo-50/30 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500/20",
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="text-slate-400">{icon}</div>
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-slate-900 placeholder-slate-400",
            icon && "pl-12",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : variantClasses[variant],
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"
