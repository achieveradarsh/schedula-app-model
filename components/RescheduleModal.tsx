"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { appointmentService } from "@/services/api"
import toast from "react-hot-toast"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newDate: string, newTimeSlot: string) => void
  appointmentDetails: {
    id: string
    doctorId: string
    doctorName: string
    currentDate: string
    currentTime: string
  }
}

export function RescheduleModal({ isOpen, onClose, onConfirm, appointmentDetails }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  // Get maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateString = maxDate.toISOString().split("T")[0]

  useEffect(() => {
    if (selectedDate && appointmentDetails.doctorId) {
      fetchAvailableSlots()
    }
  }, [selectedDate, appointmentDetails.doctorId])

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true)
    try {
      const slots = await appointmentService.getAvailableSlots(appointmentDetails.doctorId, selectedDate)
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Failed to fetch available slots:", error)
      toast.error("Failed to load available time slots")
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Please select both date and time slot")
      return
    }

    setLoading(true)
    try {
      await onConfirm(selectedDate, selectedTimeSlot)
      onClose()
      // Reset form
      setSelectedDate("")
      setSelectedTimeSlot("")
      setAvailableSlots([])
    } catch (error) {
      console.error("Failed to reschedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setSelectedDate("")
    setSelectedTimeSlot("")
    setAvailableSlots([])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Reschedule Appointment</h3>
              <p className="text-slate-600 mt-1">Choose a new date and time</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Current Appointment Info */}
          <Card className="p-4 mb-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{appointmentDetails.doctorName}</p>
                <p className="text-sm text-slate-600">
                  {appointmentDetails.currentDate} • {appointmentDetails.currentTime}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </Card>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
              Select New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTimeSlot("") // Reset time slot when date changes
              }}
              min={minDate}
              max={maxDateString}
              className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                Select Time Slot
              </label>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-slate-600">Loading available slots...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No available slots for this date. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <motion.button
                      key={slot}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedTimeSlot === slot
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose} fullWidth disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleConfirm}
              loading={loading}
              disabled={!selectedDate || !selectedTimeSlot}
              fullWidth
              glow
            >
              Reschedule Appointment
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
