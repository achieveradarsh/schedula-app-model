"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Download, Calendar, Clock, User, CreditCard, Share, Home } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AppointmentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showConfetti, setShowConfetti] = useState(true)

  const appointmentId = searchParams.get("appointmentId")
  const doctorName = searchParams.get("doctor")
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const tokenNumber = searchParams.get("token")
  const fee = searchParams.get("fee")

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDownloadReceipt = () => {
    toast.success("Receipt downloaded successfully!")
    // In real app, generate and download PDF
  }

  const handleShareAppointment = () => {
    if (navigator.share) {
      navigator.share({
        title: "Appointment Booked",
        text: `Appointment booked with ${doctorName} on ${date} at ${time}`,
      })
    } else {
      toast.success("Appointment details copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 100],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="max-w-2xl w-full">
          {/* Success Animation */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-32 h-32 mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-60"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <motion.div
                className="absolute -inset-4 border-4 border-emerald-400/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Appointment Booked! 🎉
            </motion.h1>
            <motion.p
              className="text-xl text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Your appointment has been successfully confirmed
            </motion.p>
          </motion.div>

          {/* Appointment Details Card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card variant="glass" className="p-8 mb-8 border-white/20 bg-white/95 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Appointment Details</h3>
                {tokenNumber && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-xl">
                    <p className="text-white font-semibold">Token: {tokenNumber}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Doctor</p>
                      <p className="text-slate-900 font-semibold">{doctorName || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Date</p>
                      <p className="text-slate-900 font-semibold">{date || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Time</p>
                      <p className="text-slate-900 font-semibold">{time || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Amount Paid</p>
                      <p className="text-slate-900 font-semibold">₹{fee || "0"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {appointmentId && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-slate-500 text-sm">Appointment ID</p>
                  <p className="text-slate-900 font-mono text-sm">{appointmentId}</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleDownloadReceipt}
              variant="gradient"
              size="lg"
              glow
              icon={<Download className="w-5 h-5" />}
              fullWidth
            >
              Download Receipt
            </Button>
            <Button
              onClick={handleShareAppointment}
              variant="outline"
              size="lg"
              icon={<Share className="w-5 h-5 bg-transparent" />}
              fullWidth
            >
              Share Details
            </Button>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={() => router.push("/appointments")}
              variant="secondary"
              size="lg"
              icon={<Calendar className="w-5 h-5" />}
              fullWidth
            >
              View All Appointments
            </Button>
            <Button
              onClick={() => router.push("/doctors")}
              variant="ghost"
              size="lg"
              icon={<Home className="w-5 h-5" />}
              fullWidth
              className="text-white hover:bg-white/10"
            >
              Book Another Appointment
            </Button>
          </motion.div>

          {/* Important Notes - FIXED VISIBILITY */}
          <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Card variant="glass" className="p-6 border-emerald-500/30 bg-white/95 backdrop-blur-xl">
              <h4 className="text-lg font-semibold text-emerald-600 mb-3">Important Notes:</h4>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Please arrive 15 minutes before your appointment time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Bring a valid ID and any previous medical reports</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>You can reschedule or cancel up to 2 hours before the appointment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>A confirmation SMS will be sent to your registered mobile number</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
