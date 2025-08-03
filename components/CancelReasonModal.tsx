"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface CancelReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  appointmentDetails: {
    doctorName: string
    date: string
    time: string
  }
}

const cancelReasons = [
  "Personal emergency",
  "Feeling better, no longer need consultation",
  "Doctor not available",
  "Scheduling conflict",
  "Financial constraints",
  "Found another doctor",
  "Technical issues with online consultation",
  "Other",
]

export const CancelReasonModal: React.FC<CancelReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDetails,
}) => {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const reason = selectedReason === "Other" ? customReason : selectedReason
      await onConfirm(reason)
      onClose()
      setSelectedReason("")
      setCustomReason("")
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedReason("")
    setCustomReason("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card variant="glass" className="p-8 border-white/20 backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cancel Appointment</h3>
                    <p className="text-sm text-slate-600">We're sorry to see you go</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Appointment Details */}
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Appointment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span>{appointmentDetails.doctorName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{appointmentDetails.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{appointmentDetails.time}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-4">
                  Why are you cancelling? <span className="text-slate-500 font-normal">(Optional)</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cancelReasons.map((reason) => (
                    <motion.button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                        selectedReason === reason
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm font-medium">{reason}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Reason Input */}
                <AnimatePresence>
                  {selectedReason === "Other" && (
                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please specify your reason..."
                        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400 resize-none"
                        rows={3}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1 bg-transparent">
                  Keep Appointment
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirm}
                  loading={loading}
                  disabled={selectedReason === "Other" && !customReason.trim()}
                  className="flex-1"
                >
                  Cancel Appointment
                </Button>
              </div>

              {/* Note */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> Cancellation fees may apply depending on the timing. Please check our
                  cancellation policy for more details.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
