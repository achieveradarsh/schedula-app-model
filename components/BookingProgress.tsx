"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface BookingProgressProps {
  currentStep: number
  steps: Array<{
    id: number
    title: string
    icon: React.ReactNode
    completed: boolean
  }>
}

export const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-slate-200 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                step.completed
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white"
                  : currentStep === step.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500 text-white"
                    : "bg-white border-slate-300 text-slate-400"
              }`}
              whileHover={{ scale: 1.1 }}
              animate={
                currentStep === step.id
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(99, 102, 241, 0.4)",
                        "0 0 0 10px rgba(99, 102, 241, 0)",
                        "0 0 0 0 rgba(99, 102, 241, 0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: currentStep === step.id ? Number.POSITIVE_INFINITY : 0 }}
            >
              {step.completed ? <Check className="w-5 h-5" /> : step.icon}
            </motion.div>
            <motion.p
              className={`mt-2 text-xs font-medium text-center ${
                step.completed || currentStep === step.id ? "text-slate-900" : "text-slate-500"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {step.title}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
