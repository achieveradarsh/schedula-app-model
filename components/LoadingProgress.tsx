"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CheckCircle, Zap } from "lucide-react"
import { Card } from "@/components/ui/Card"

interface LoadingProgressProps {
  steps: Array<{
    id: string
    title: string
    description: string
    icon: React.ReactNode
    completed: boolean
    active: boolean
  }>
  currentStep: string
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ steps, currentStep }) => {
  return (
    <Card variant="glass" className="p-8 border-white/20">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Processing Your Request</h3>
          <p className="text-slate-600">Please wait while we complete your booking...</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-500 ${
                step.completed
                  ? "bg-emerald-50 border border-emerald-200"
                  : step.active
                    ? "bg-indigo-50 border border-indigo-200"
                    : "bg-slate-50 border border-slate-200"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  step.completed ? "bg-emerald-500" : step.active ? "bg-indigo-500" : "bg-slate-300"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : step.active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    {step.icon}
                  </motion.div>
                ) : (
                  <div className="text-white">{step.icon}</div>
                )}
              </div>

              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    step.completed ? "text-emerald-700" : step.active ? "text-indigo-700" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-sm ${
                    step.completed ? "text-emerald-600" : step.active ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {step.active && (
                <motion.div
                  className="flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center pt-6 border-t border-slate-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-slate-500">This usually takes 10-15 seconds. Please don't close this window.</p>
        </motion.div>
      </div>
    </Card>
  )
}
