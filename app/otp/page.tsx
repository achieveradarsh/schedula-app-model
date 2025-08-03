"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { authService } from "@/services/api"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

interface OTPForm {
  digit1: string
  digit2: string
  digit3: string
  digit4: string
}

export default function OTPPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [userType, setUserType] = useState<"patient" | "doctor">("patient")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OTPForm>()

  const watchedValues = watch()

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber")
    const type = localStorage.getItem("userType") as "patient" | "doctor"
    if (phone) setPhoneNumber(phone)
    if (type) setUserType(type)

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const onSubmit = async (data: OTPForm) => {
    const otp = `${data.digit1}${data.digit2}${data.digit3}${data.digit4}`

    if (otp.length !== 4) {
      toast.error("Please enter complete OTP")
      return
    }

    setLoading(true)
    try {
      // FIXED: Pass parameters in correct order
      const result = await authService.verifyOTP(phoneNumber, otp, userType)

      if (result.success) {
        login(result.user)
        toast.success(`Welcome, ${result.user.name}!`)

        // Clear localStorage
        localStorage.removeItem("phoneNumber")
        localStorage.removeItem("userType")

        // FIXED: Proper navigation based on user type
        if (userType === "doctor") {
          router.push("/doctor/dashboard")
        } else {
          router.push("/doctors")
        }
      }
    } catch (error) {
      console.error("OTP verification failed:", error)
      toast.error("Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const fieldName = `digit${index + 1}` as keyof OTPForm
      setValue(fieldName, value)

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !watchedValues[`digit${index + 1}` as keyof OTPForm] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendCode = async () => {
    setCountdown(60)
    setValue("digit1", "")
    setValue("digit2", "")
    setValue("digit3", "")
    setValue("digit4", "")
    inputRefs.current[0]?.focus()
    toast.success("OTP sent successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="ghost" size="sm" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </motion.div>

          <Card className="p-6">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Number</h1>
              <p className="text-gray-600">
                We've sent a 4-digit code to <span className="font-semibold text-blue-600">{phoneNumber}</span>
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <motion.div
                className="flex justify-center space-x-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[0, 1, 2, 3].map((index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 hover:border-gray-300"
                    {...register(`digit${index + 1}` as keyof OTPForm, {
                      required: "Required",
                      pattern: {
                        value: /^\d$/,
                        message: "Must be a digit",
                      },
                    })}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    whileFocus={{ scale: 1.05 }}
                  />
                ))}
              </motion.div>

              {(errors.digit1 || errors.digit2 || errors.digit3 || errors.digit4) && (
                <motion.p
                  className="text-red-600 text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Please enter complete OTP
                </motion.p>
              )}

              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {countdown > 0 ? (
                  <p className="text-gray-600">
                    Resend code in <span className="font-semibold text-blue-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Resend Code
                  </button>
                )}
              </motion.div>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Verify & Continue
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
