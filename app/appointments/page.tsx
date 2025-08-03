"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, User, Phone, MapPin, Video, XCircle, RotateCcw, Download, Search, LogOut } from "lucide-react"
import { appointmentService, doctorService } from "@/services/api"
import type { Appointment, Doctor } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CancelReasonModal } from "@/components/CancelReasonModal"
import { RescheduleModal } from "@/components/RescheduleModal"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    appointment: Appointment | null
  }>({ isOpen: false, appointment: null })
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean
    appointment: Appointment | null
  }>({ isOpen: false, appointment: null })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsData, doctorsData] = await Promise.all([
          appointmentService.getAppointments(user?.id, user?.role),
          doctorService.getAllDoctors(),
        ])
        setAppointments(appointmentsData)
        setDoctors(doctorsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }

    // Listen for real-time updates
    const handleAppointmentUpdate = (event: CustomEvent) => {
      const { appointmentId, status, newDate, newTimeSlot } = event.detail
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status,
                updatedAt: new Date().toISOString(),
                ...(newDate && { date: newDate }),
                ...(newTimeSlot && { timeSlot: newTimeSlot }),
              }
            : apt,
        ),
      )
    }

    const handleAppointmentRescheduled = (event: CustomEvent) => {
      const { appointmentId, newDate, newTimeSlot } = event.detail
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                date: newDate,
                timeSlot: newTimeSlot,
                status: "scheduled",
                updatedAt: new Date().toISOString(),
              }
            : apt,
        ),
      )
    }

    window.addEventListener("appointmentUpdated", handleAppointmentUpdate as EventListener)
    window.addEventListener("appointmentRescheduled", handleAppointmentRescheduled as EventListener)

    return () => {
      window.removeEventListener("appointmentUpdated", handleAppointmentUpdate as EventListener)
      window.removeEventListener("appointmentRescheduled", handleAppointmentRescheduled as EventListener)
    }
  }, [user])

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor?.name || "Unknown Doctor"
  }

  const getDoctorSpecialty = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor?.specialization || "General"
  }

  const handleCancelAppointment = async (reason?: string) => {
    if (!cancelModal.appointment) return

    try {
      await appointmentService.updateAppointmentStatus(cancelModal.appointment.id, "cancelled", reason)
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === cancelModal.appointment!.id ? { ...apt, status: "cancelled", cancelReason: reason } : apt,
        ),
      )
      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  const handleRescheduleAppointment = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (appointment) {
      setRescheduleModal({ isOpen: true, appointment })
    }
  }

  const handleConfirmReschedule = async (newDate: string, newTimeSlot: string) => {
    if (!rescheduleModal.appointment) return

    try {
      await appointmentService.updateAppointmentStatus(
        rescheduleModal.appointment.id,
        "scheduled",
        undefined,
        newDate,
        newTimeSlot
      )
      
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === rescheduleModal.appointment!.id
            ? {
                ...apt,
                date: newDate,
                timeSlot: newTimeSlot,
                status: "scheduled",
                updatedAt: new Date().toISOString(),
              }
            : apt,
        ),
      )

      // Dispatch real-time update event
      window.dispatchEvent(
        new CustomEvent("appointmentRescheduled", {
          detail: {
            appointmentId: rescheduleModal.appointment.id,
            newDate,
            newTimeSlot,
          },
        }),
      )

      toast.success("Appointment rescheduled successfully")
      setRescheduleModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error("Failed to reschedule appointment:", error)
      toast.error("Failed to reschedule appointment")
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab = apt.status === selectedTab || (selectedTab === "upcoming" && apt.status === "scheduled")
    const matchesSearch =
      searchQuery === "" ||
      getDoctorName(apt.doctorId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.symptoms?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  const tabs = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: appointments.filter((a) => a.status === "scheduled").length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      key: "completed",
      label: "Completed",
      count: appointments.filter((a) => a.status === "completed").length,
      color: "from-emerald-500 to-teal-500",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: appointments.filter((a) => a.status === "cancelled").length,
      color: "from-red-500 to-pink-500",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your appointments..." variant="gradient" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-24">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl shadow-2xl border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Appointments 📅
              </h1>
              <p className="text-slate-600 text-lg mt-1">Manage your healthcare appointments</p>
            </motion.div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => router.push("/doctors")} variant="gradient" size="lg" glow>
                Book New Appointment ⚡
              </Button>
              {user?.role === "patient" && (
                <Button variant="danger" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search appointments by doctor or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex space-x-2 overflow-x-auto pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedTab === tab.key
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedTab === tab.key ? "bg-white/20" : "bg-slate-100"
                  }`}
                >
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Appointments List */}
      <div className="px-6 py-8">
        <AnimatePresence>
          {filteredAppointments.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-slate-100/10 to-slate-200/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No {selectedTab} appointments</h3>
              <p className="text-slate-300 mb-6">
                {selectedTab === "upcoming"
                  ? "You don't have any upcoming appointments"
                  : `No ${selectedTab} appointments found`}
              </p>
              {selectedTab === "upcoming" && (
                <Button onClick={() => router.push("/doctors")} variant="gradient" glow>
                  Book Your First Appointment ✨
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover variant="glass" glow className="p-8 border-white/20 bg-white/95">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-6 flex-1">
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-indigo-100/20 to-purple-100/20 rounded-2xl flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-xl font-bold text-white">
                            {getDoctorName(appointment.doctorId)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </motion.div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {getDoctorName(appointment.doctorId)}
                              </h3>
                              <p className="text-indigo-600 font-semibold">
                                {getDoctorSpecialty(appointment.doctorId)}
                              </p>
                              {user?.role === "doctor" && (
                                <div className="mt-2">
                                  <p className="text-slate-700 text-sm">Patient: {appointment.patientName}</p>
                                  <p className="text-slate-700 text-sm flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {appointment.patientPhone}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  appointment.status === "scheduled"
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : appointment.status === "completed"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                              {appointment.tokenNumber && (
                                <p className="text-slate-700 text-sm mt-2">Token: {appointment.tokenNumber}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-indigo-600" />
                              <span className="text-slate-700 text-sm">{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span className="text-slate-700 text-sm">{appointment.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {appointment.consultationType === "online" ? (
                                <Video className="w-4 h-4 text-purple-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-orange-600" />
                              )}
                              <span className="text-slate-700 text-sm capitalize">{appointment.consultationType}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-600 font-semibold">₹{appointment.consultationFee}</span>
                            </div>
                          </div>

                          {appointment.symptoms && (
                            <div className="mb-4">
                              <p className="text-slate-700 text-sm">
                                <span className="font-medium text-slate-900">Symptoms:</span> {appointment.symptoms}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3">
                            {appointment.status === "scheduled" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRescheduleAppointment(appointment.id)}
                                  icon={<RotateCcw className="w-4 h-4 bg-transparent" />}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    setCancelModal({
                                      isOpen: true,
                                      appointment,
                                    })
                                  }
                                  icon={<XCircle className="w-4 h-4" />}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === "completed" && (
                              <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />}>
                                Download Receipt
                              </Button>
                            )}
                            {appointment.consultationType === "online" && appointment.status === "scheduled" && (
                              <Button size="sm" variant="success" icon={<Video className="w-4 h-4" />}>
                                Join Video Call
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Reason Modal */}
      <CancelReasonModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointment: null })}
        onConfirm={handleCancelAppointment}
        appointmentDetails={{
          doctorName: cancelModal.appointment ? getDoctorName(cancelModal.appointment.doctorId) : "",
          date: cancelModal.appointment?.date || "",
          time: cancelModal.appointment?.timeSlot || "",
        }}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmReschedule}
        appointmentDetails={{
          id: rescheduleModal.appointment?.id || "",
          doctorId: rescheduleModal.appointment?.doctorId || "",
          doctorName: rescheduleModal.appointment ? getDoctorName(rescheduleModal.appointment.doctorId) : "",
          currentDate: rescheduleModal.appointment?.date || "",
          currentTime: rescheduleModal.appointment?.timeSlot || "",
        }}
      />

      {/* Bottom Navigation */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 px-6 py-4 shadow-2xl"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex justify-around">
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-indigo-600"
            onClick={() => router.push("/doctors")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-xs">Find Doctor</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-indigo-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Appointments</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-emerald-600"
            onClick={() => router.push("/records")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Records</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-blue-600"
            onClick={() => router.push("/profile")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
