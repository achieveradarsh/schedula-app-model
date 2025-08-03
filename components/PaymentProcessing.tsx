"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CheckCircle, Clock, CreditCard, Shield, Zap } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { useEffect, useState } from "react"

interface PaymentProcessingProps {
  onComplete: () => void
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  amount: number
}

const processingSteps = [
  {
    id: 1,
    title: "Verifying Payment Details",
    description: "Checking your payment information",
    icon: CreditCard,
    duration: 2000,
  },
  {
    id: 2,
    title: "Checking Doctor Availability",
    description: "Confirming the selected time slot",
    icon: Clock,
    duration: 1500,
  },
  {
    id: 3,
    title: "Securing Your Appointment",
    description: "Encrypting your medical data",
    icon: Shield,
    duration: 1800,
  },
  {
    id: 4,
    title: "Processing Payment",
    description: "Completing the transaction",
    icon: Zap,
    duration: 2200,
  },
  {
    id: 5,
    title: "Booking Confirmed!",
    description: "Your appointment has been successfully booked",
    icon: CheckCircle,
    duration: 1000,
  },
]

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  onComplete,
  doctorName,
  appointmentDate,
  appointmentTime,
  amount,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stepTimer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    const processStep = (stepIndex: number) => {
      if (stepIndex >= processingSteps.length) {
        setTimeout(onComplete, 500)
        return
      }

      setCurrentStep(stepIndex)
      const step = processingSteps[stepIndex]

      // Animate progress for current step
      let currentProgress = (stepIndex / processingSteps.length) * 100
      const targetProgress = ((stepIndex + 1) / processingSteps.length) * 100
      const progressIncrement = (targetProgress - currentProgress) / (step.duration / 50)

      progressTimer = setInterval(() => {
        currentProgress += progressIncrement
        setProgress(Math.min(currentProgress, targetProgress))
      }, 50)

      stepTimer = setTimeout(() => {
        clearInterval(progressTimer)
        setProgress(targetProgress)
        processStep(stepIndex + 1)
      }, step.duration)
    }

    processStep(0)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
    }
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Zap className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Processing Your Appointment</h1>
          <p className="text-slate-300">Please wait while we secure your booking...</p>
        </motion.div>

        <Card variant="glass" className="p-8 mb-8 border-white/20 bg-white/95 backdrop-blur-xl">
          {/* Appointment Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Appointment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <p className="text-sm text-slate-600">Doctor</p>
                <p className="font-semibold text-slate-900">{doctorName}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <p className="text-sm text-slate-600">Date & Time</p>
                <p className="font-semibold text-slate-900">{appointmentDate}</p>
                <p className="text-sm text-slate-700">{appointmentTime}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-semibold text-slate-900">₹{amount}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm font-medium text-slate-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              const isUpcoming = index > currentStep

              return (
                <motion.div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200"
                      : isCompleted
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200"
                        : "bg-slate-50 border-2 border-slate-200"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                        : isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-slate-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isUpcoming ? "text-slate-500" : "text-white"}`} />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        isActive ? "text-indigo-700" : isCompleted ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isActive ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  )}
                  {isCompleted && (
                    <motion.div
                      className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Security Notice */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Card variant="glass" className="p-4 border-emerald-500/30 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Your payment and medical data are encrypted and secure</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
