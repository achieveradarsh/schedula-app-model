"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar as BigCalendar, momentLocalizer, Views, type View } from "react-big-calendar"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import moment from "moment"
import { 
  ArrowLeft, Plus, Filter, Clock, User, Video, MapPin, XCircle, CheckCircle, 
  Calendar as CalendarIcon, Phone, Stethoscope, RotateCcw, AlertCircle,
  ChevronDown, Badge, Pill, FileText, Edit3
} from "lucide-react"
import { appointmentService } from "@/services/api"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CancelReasonModal } from "@/components/CancelReasonModal"
import { RescheduleModal } from "@/components/RescheduleModal"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)
const DragAndDropCalendar = withDragAndDrop(BigCalendar)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Appointment
  isDraggable: boolean
}

interface FilterCounts {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  rescheduled: number
}

interface FilterState {
  status: "all" | "scheduled" | "completed" | "cancelled" | "rescheduled"
  consultationType: "all" | "online" | "offline"
}

export default function DoctorCalendarPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    consultationType: "all"
  })
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0
  })
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    appointment: Appointment | null
  }>({ isOpen: false, appointment: null })
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean
    appointment: Appointment | null
  }>({ isOpen: false, appointment: null })
  
  // Custom tooltip state
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    event: CalendarEvent | null
  }>({ show: false, x: 0, y: 0, event: null })

  // Effect to manage body class for modal state
  useEffect(() => {
    if (showEventDetails || cancelModal.isOpen || rescheduleModal.isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showEventDetails, cancelModal.isOpen, rescheduleModal.isOpen]);

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }

    const fetchAppointments = async () => {
      try {
        const appointmentsData = await appointmentService.getAppointments(user.id, "doctor")
        setAppointments(appointmentsData)
        calculateFilterCounts(appointmentsData)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
        toast.error("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, router])

  useEffect(() => {
    applyFilters()
  }, [appointments, filters])

  const calculateFilterCounts = (allAppointments: Appointment[]) => {
    const counts = allAppointments.reduce((acc, apt) => {
      acc.total++
      acc[apt.status as keyof Omit<FilterCounts, 'total'>]++
      return acc
    }, {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0
    })
    setFilterCounts(counts)
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }

    // Filter by consultation type
    if (filters.consultationType !== "all") {
      filtered = filtered.filter(apt => apt.consultationType === filters.consultationType)
    }

    // Convert to calendar events
    const calendarEvents: CalendarEvent[] = filtered.map((apt) => {
      const [startTime, endTime] = apt.timeSlot.split(" - ")
      const startDate = moment(`${apt.date} ${startTime}`, "YYYY-MM-DD h:mm A").toDate()
      const endDate = moment(`${apt.date} ${endTime}`, "YYYY-MM-DD h:mm A").toDate()

      return {
        id: apt.id,
        title: `${apt.patientName} - ${apt.consultationType}`,
        start: startDate,
        end: endDate,
        resource: apt,
        isDraggable: apt.status === "scheduled",
      }
    })

    setFilteredEvents(calendarEvents)
  }

  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      const newDate = moment(start).format("YYYY-MM-DD")
      const newTimeSlot = `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`

      // Update the appointment with reschedule tracking
      await appointmentService.rescheduleAppointment(event.id, newDate, newTimeSlot)

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === event.id
            ? {
                ...apt,
                date: newDate,
                timeSlot: newTimeSlot,
                status: "rescheduled" as const,
                rescheduledBy: "doctor" as const,
                rescheduledAt: new Date().toISOString(),
                originalDate: apt.originalDate || apt.date,
                originalTimeSlot: apt.originalTimeSlot || apt.timeSlot,
                rescheduledCount: (apt.rescheduledCount || 0) + 1,
              }
            : apt,
        ),
      )

      toast.success("Appointment rescheduled successfully!")
    } catch (error) {
      console.error("Failed to reschedule appointment:", error)
      toast.error("Failed to reschedule appointment")
    }
  }, [])

  const handleEventResize = useCallback(async ({ event, start, end }: any) => {
    try {
      const newDate = moment(start).format("YYYY-MM-DD")
      const newTimeSlot = `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`

      await appointmentService.rescheduleAppointment(event.id, newDate, newTimeSlot)

      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === event.id
            ? {
                ...apt,
                date: newDate,
                timeSlot: newTimeSlot,
                status: "rescheduled" as const,
                rescheduledBy: "doctor" as const,
                rescheduledAt: new Date().toISOString(),
                originalDate: apt.originalDate || apt.date,
                originalTimeSlot: apt.originalTimeSlot || apt.timeSlot,
                rescheduledCount: (apt.rescheduledCount || 0) + 1,
              }
            : apt,
        ),
      )

      toast.success("Appointment time updated successfully!")
    } catch (error) {
      console.error("Failed to update appointment time:", error)
      toast.error("Failed to update appointment time")
    }
  }, [])

  const handleSelectEvent = (event: CalendarEvent) => {
    // Hide tooltip immediately when opening modal
    hideCustomTooltip()
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleCancelAppointment = async (reason?: string) => {
    if (!cancelModal.appointment) return

    try {
      await appointmentService.updateAppointmentStatus(cancelModal.appointment.id, "cancelled", reason)

      // Update appointments state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === cancelModal.appointment!.id
            ? { ...apt, status: "cancelled" as const, cancelReason: reason }
            : apt,
        ),
      )

      toast.success("Appointment cancelled successfully")
      setCancelModal({ isOpen: false, appointment: null })
      setShowEventDetails(false)
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, "completed")

      // Update appointments state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "completed" as const }
            : apt,
        ),
      )

      toast.success("Appointment marked as completed")
      setShowEventDetails(false)
    } catch (error) {
      console.error("Failed to complete appointment:", error)
      toast.error("Failed to complete appointment")
    }
  }

  const handleRescheduleAppointment = async (newDate: string, newTimeSlot: string) => {
    if (!rescheduleModal.appointment) return

    try {
      await appointmentService.rescheduleAppointment(rescheduleModal.appointment.id, newDate, newTimeSlot)

      // Update appointments state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === rescheduleModal.appointment!.id
            ? {
                ...apt,
                date: newDate,
                timeSlot: newTimeSlot,
                status: "rescheduled" as const,
                rescheduledBy: "doctor" as const,
                rescheduledAt: new Date().toISOString(),
                originalDate: apt.originalDate || apt.date,
                originalTimeSlot: apt.originalTimeSlot || apt.timeSlot,
                rescheduledCount: (apt.rescheduledCount || 0) + 1,
              }
            : apt,
        ),
      )

      toast.success("Appointment rescheduled successfully!")
      setRescheduleModal({ isOpen: false, appointment: null })
      setShowEventDetails(false)
    } catch (error) {
      console.error("Failed to reschedule appointment:", error)
      toast.error("Failed to reschedule appointment")
    }
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const { status } = event.resource
    let backgroundColor = "#3174ad"
    let borderColor = "#3174ad"

    switch (status) {
      case "scheduled":
        backgroundColor = "#3b82f6"
        borderColor = "#2563eb"
        break
      case "completed":
        backgroundColor = "#10b981"
        borderColor = "#059669"
        break
      case "cancelled":
        backgroundColor = "#ef4444"
        borderColor = "#dc2626"
        break
      case "rescheduled":
        backgroundColor = "#f59e0b"
        borderColor = "#d97706"
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "12px",
        padding: "2px 6px",
      },
    }
  }

  // Enhanced tooltip with comprehensive patient information
  const getTooltipContent = (event: CalendarEvent) => {
    const apt = event.resource
    const statusEmoji = {
      scheduled: "📅",
      completed: "✅", 
      cancelled: "❌",
      rescheduled: "🔄"
    }

    let tooltip = `${statusEmoji[apt.status]} ${apt.patientName}\n`
    tooltip += `📞 ${apt.patientPhone}\n`
    tooltip += `🕒 ${apt.timeSlot}\n`
    tooltip += `📍 ${apt.consultationType === "online" ? "Online Consultation" : "Offline Consultation"}\n`
    
    if (apt.symptoms) {
      tooltip += `🩺 ${apt.symptoms}\n`
    }
    
    tooltip += `💰 ₹${apt.consultationFee}\n`
    tooltip += `🎫 Token: ${apt.tokenNumber}`

    if (apt.status === "rescheduled" && apt.rescheduledBy) {
      tooltip += `\n🔄 Rescheduled by: ${apt.rescheduledBy === "doctor" ? "You" : "Patient"}`
      if (apt.rescheduledAt) {
        tooltip += `\n🕒 Rescheduled: ${moment(apt.rescheduledAt).format("MMM DD, YYYY h:mm A")}`
      }
      if (apt.originalDate && apt.originalTimeSlot) {
        tooltip += `\n📅 Original: ${moment(apt.originalDate).format("MMM DD, YYYY")} ${apt.originalTimeSlot}`
      }
    }

    if (apt.status === "cancelled" && apt.cancelReason) {
      tooltip += `\n❌ Reason: ${apt.cancelReason}`
    }

    return tooltip
  }

  // Enhanced custom glassmorphism tooltip functions with better responsiveness
  const showCustomTooltip = (e: React.MouseEvent, event: CalendarEvent) => {
    // Don't show tooltip if modal is open
    if (showEventDetails) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    // Calculate optimal position
    let x = rect.left + rect.width / 2
    let y = rect.top - 10
    
    // Adjust if tooltip would go off screen
    if (x > windowWidth - 200) {
      x = windowWidth - 220
    }
    if (x < 220) {
      x = 220
    }
    if (y < 200) {
      y = rect.bottom + 10
    }
    
    setTooltip({
      show: true,
      x,
      y,
      event
    })
  }

  const hideCustomTooltip = () => {
    setTooltip({ show: false, x: 0, y: 0, event: null })
  }

  // Hide tooltip when modals open
  useEffect(() => {
    if (showEventDetails || cancelModal.isOpen || rescheduleModal.isOpen) {
      hideCustomTooltip()
    }
  }, [showEventDetails, cancelModal.isOpen, rescheduleModal.isOpen])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading calendar..." variant="gradient" />
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl shadow-2xl border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/doctor/dashboard")}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="hover:bg-slate-100 text-slate-700"
                >
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Appointment Calendar 📅
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">Drag and drop to reschedule appointments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="gradient" size="lg" glow icon={<Plus className="w-5 h-5" />}>
                  New Appointment
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Filters & Stats */}
          <motion.div
            className="w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats Cards */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Appointment Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-white/80 text-xs font-medium">Total</p>
                  <p className="text-white text-2xl font-bold">{filterCounts.total}</p>
                </motion.div>
                <motion.div
                  className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-300/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-blue-200 text-xs font-medium">Scheduled</p>
                  <p className="text-white text-2xl font-bold">{filterCounts.scheduled}</p>
                </motion.div>
                <motion.div
                  className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-300/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-emerald-200 text-xs font-medium">Completed</p>
                  <p className="text-white text-2xl font-bold">{filterCounts.completed}</p>
                </motion.div>
                <motion.div
                  className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-300/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-orange-200 text-xs font-medium">Rescheduled</p>
                  <p className="text-white text-2xl font-bold">{filterCounts.rescheduled}</p>
                </motion.div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Appointments
                </h3>
                
                {/* Status Filter */}
                <div className="mb-6">
                  <label className="text-white/80 text-sm font-medium mb-3 block">Status</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.status === "all"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      All Appointments ({filterCounts.total})
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: "scheduled" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.status === "scheduled"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      📅 Scheduled ({filterCounts.scheduled})
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: "completed" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.status === "completed"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      ✅ Completed ({filterCounts.completed})
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: "cancelled" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.status === "cancelled"
                          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      ❌ Cancelled ({filterCounts.cancelled})
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: "rescheduled" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.status === "rescheduled"
                          ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      🔄 Rescheduled ({filterCounts.rescheduled})
                    </button>
                  </div>
                </div>

                {/* Consultation Type Filter */}
                <div>
                  <label className="text-white/80 text-sm font-medium mb-3 block">Consultation Type</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, consultationType: "all" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.consultationType === "all"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      🏥 All Types
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, consultationType: "online" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.consultationType === "online"
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      🖥️ Online Consultations
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, consultationType: "offline" }))}
                      className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        filters.consultationType === "offline"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      🏢 Offline Consultations
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-6 border-t border-white/20">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth 
                    className="text-white border-white/30 hover:bg-white/10"
                    icon={<Clock className="w-4 h-4" />}
                  >
                    Today's Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth 
                    className="text-white border-white/30 hover:bg-white/10"
                    icon={<User className="w-4 h-4" />}
                  >
                    Patient List
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Calendar Section */}
          <div className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Calendar Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  {[Views.MONTH, Views.WEEK, Views.DAY].map((viewName) => (
                    <button
                      key={viewName}
                      onClick={() => setView(viewName)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === viewName
                          ? "bg-white text-indigo-600 shadow-lg"
                          : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                      }`}
                    >
                      {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="text-white font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                  {moment(date).format("MMMM YYYY")}
                </div>
              </div>

              <Card variant="glass" className="p-4 border-white/20 h-[calc(100vh-280px)]">
                <div style={{ height: "100%" }}>
                  <DragAndDropCalendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    resizable
                    selectable
                    popup
                    tooltipAccessor={() => null} // Disable default tooltip
                    components={{
                      event: ({ event }: { event: CalendarEvent }) => (
                        <div 
                          className="flex items-center justify-between w-full h-full relative group cursor-pointer p-1"
                          onMouseEnter={(e) => showCustomTooltip(e, event)}
                          onMouseLeave={hideCustomTooltip}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectEvent(event)
                          }}
                          style={{ minHeight: '100%' }}
                        >
                          <span className="truncate flex-1">{event.title}</span>
                          <div className="flex items-center space-x-1 ml-1">
                            {event.resource.consultationType === "online" && <Video className="w-3 h-3" />}
                            {event.resource.status === "rescheduled" && <RotateCcw className="w-3 h-3" />}
                          </div>
                          
                          {/* Invisible hover area extension */}
                          <div 
                            className="absolute inset-0 -m-1"
                            onMouseEnter={(e) => showCustomTooltip(e, event)}
                            onMouseLeave={hideCustomTooltip}
                          />
                        </div>
                      ),
                    }}
                    formats={{
                      timeGutterFormat: "h:mm A",
                      eventTimeRangeFormat: ({ start, end }: {start: any, end: any}) =>
                        `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`,
                    }}
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                  Appointment Details
                  <div className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedEvent.resource.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                    selectedEvent.resource.status === "completed" ? "bg-green-100 text-green-700" :
                    selectedEvent.resource.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {selectedEvent.resource.status.toUpperCase()}
                  </div>
                </h3>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{selectedEvent.resource.patientName}</p>
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {selectedEvent.resource.patientPhone}
                      </span>
                      <span className="flex items-center">
                        <Badge className="w-3 h-3 mr-1" />
                        Token: {selectedEvent.resource.tokenNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{selectedEvent.resource.timeSlot}</p>
                    <p className="text-sm text-slate-600">{moment(selectedEvent.resource.date).format("MMMM DD, YYYY (dddd)")}</p>
                    {selectedEvent.resource.status === "rescheduled" && selectedEvent.resource.originalDate && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Originally: {moment(selectedEvent.resource.originalDate).format("MMM DD, YYYY")} {selectedEvent.resource.originalTimeSlot}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  {selectedEvent.resource.consultationType === "online" ? (
                    <Video className="w-5 h-5 text-purple-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-orange-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 capitalize">
                      {selectedEvent.resource.consultationType} Consultation
                    </p>
                    <p className="text-sm text-slate-600">₹{selectedEvent.resource.consultationFee}</p>
                  </div>
                </div>

                {selectedEvent.resource.symptoms && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Stethoscope className="w-5 h-5 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900 mb-1">Symptoms & Concerns</p>
                        <p className="text-sm text-slate-700">{selectedEvent.resource.symptoms}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.resource.status === "rescheduled" && selectedEvent.resource.rescheduledBy && (
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-start space-x-3">
                      <RotateCcw className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900 mb-1">Reschedule Information</p>
                        <p className="text-sm text-orange-700">
                          Rescheduled by: <span className="font-medium">
                            {selectedEvent.resource.rescheduledBy === "doctor" ? "You (Doctor)" : "Patient"}
                          </span>
                        </p>
                        {selectedEvent.resource.rescheduledAt && (
                          <p className="text-xs text-orange-600 mt-1">
                            {moment(selectedEvent.resource.rescheduledAt).format("MMM DD, YYYY h:mm A")}
                          </p>
                        )}
                        {selectedEvent.resource.rescheduledCount && selectedEvent.resource.rescheduledCount > 1 && (
                          <p className="text-xs text-orange-600">
                            Rescheduled {selectedEvent.resource.rescheduledCount} times
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.resource.status === "cancelled" && selectedEvent.resource.cancelReason && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 mb-1">Cancellation Reason</p>
                        <p className="text-sm text-red-700">{selectedEvent.resource.cancelReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {selectedEvent.resource.status === "scheduled" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleCompleteAppointment(selectedEvent.id)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleModal({ isOpen: true, appointment: selectedEvent.resource })
                        setShowEventDetails(false)
                      }}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setCancelModal({ isOpen: true, appointment: selectedEvent.resource })
                        setShowEventDetails(false)
                      }}
                      icon={<XCircle className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selectedEvent.resource.status === "rescheduled" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleCompleteAppointment(selectedEvent.id)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleModal({ isOpen: true, appointment: selectedEvent.resource })
                        setShowEventDetails(false)
                      }}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Reschedule Again
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setCancelModal({ isOpen: true, appointment: selectedEvent.resource })
                        setShowEventDetails(false)
                      }}
                      icon={<XCircle className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selectedEvent.resource.consultationType === "online" &&
                  (selectedEvent.resource.status === "scheduled" || selectedEvent.resource.status === "rescheduled") && (
                    <Button size="sm" variant="secondary" icon={<Video className="w-4 h-4" />}>
                      Join Call
                    </Button>
                  )}
                {selectedEvent.resource.status === "completed" && (
                  <>
                    <Link href={`/doctor/prescriptions/create?appointmentId=${selectedEvent.resource.id}&patientId=${selectedEvent.resource.patientId}`}>
                      <Button
                        size="sm"
                        variant="gradient"
                        icon={<Pill className="w-4 h-4" />}
                      >
                        Create Prescription
                      </Button>
                    </Link>
                    <Link href="/doctor/prescriptions">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<FileText className="w-4 h-4" />}
                      >
                        View Prescriptions
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Edit3 className="w-4 h-4" />}
                    >
                      Add Notes
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Cancel Reason Modal */}
        <CancelReasonModal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false, appointment: null })}
          onConfirm={handleCancelAppointment}
          appointmentDetails={{
            doctorName: user?.name || "Doctor",
            date: cancelModal.appointment?.date || "",
            time: cancelModal.appointment?.timeSlot || "",
          }}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          isOpen={rescheduleModal.isOpen}
          onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
          onConfirm={handleRescheduleAppointment}
          appointmentDetails={{
            id: rescheduleModal.appointment?.id || "",
            doctorId: rescheduleModal.appointment?.doctorId || "",
            doctorName: user?.name || "Doctor",
            currentDate: rescheduleModal.appointment?.date || "",
            currentTime: rescheduleModal.appointment?.timeSlot || "",
          }}
        />

        {/* Custom Glassmorphism Tooltip */}
        <AnimatePresence>
          {tooltip.show && tooltip.event && !showEventDetails && !cancelModal.isOpen && !rescheduleModal.isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed z-[999] pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%) translateY(-100%)'
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40 max-w-sm min-w-[280px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      tooltip.event.resource.status === "scheduled" ? "bg-blue-500" :
                      tooltip.event.resource.status === "completed" ? "bg-emerald-500" :
                      tooltip.event.resource.status === "cancelled" ? "bg-red-500" :
                      "bg-orange-500"
                    }`}></div>
                    <span className="text-sm font-semibold text-slate-800 capitalize">
                      {tooltip.event.resource.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {tooltip.event.resource.consultationType === "online" && (
                      <Video className="w-4 h-4 text-purple-600" />
                    )}
                    {tooltip.event.resource.status === "rescheduled" && (
                      <RotateCcw className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </div>

                {/* Patient Info */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-900">{tooltip.event.resource.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 ml-6">
                    <Phone className="w-3 h-3" />
                    <span>{tooltip.event.resource.patientPhone}</span>
                  </div>
                </div>

                {/* Time & Date */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-800">{tooltip.event.resource.timeSlot}</span>
                  </div>
                  <div className="text-sm text-slate-600 ml-6">
                    {moment(tooltip.event.resource.date).format("MMMM DD, YYYY (dddd)")}
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    {tooltip.event.resource.consultationType === "online" ? (
                      <Video className="w-4 h-4 text-purple-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm font-medium text-slate-800 capitalize">
                      {tooltip.event.resource.consultationType} Consultation
                    </span>
                    <span className="text-sm text-slate-600">• ₹{tooltip.event.resource.consultationFee}</span>
                  </div>
                </div>

                {/* Symptoms */}
                {tooltip.event.resource.symptoms && (
                  <div className="mb-3">
                    <div className="flex items-start space-x-2">
                      <Stethoscope className="w-4 h-4 text-pink-600 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-800">Symptoms:</span>
                        <p className="text-sm text-slate-700 mt-1 line-clamp-2">{tooltip.event.resource.symptoms}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Token Number */}
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm text-slate-600">Token: {tooltip.event.resource.tokenNumber}</span>
                </div>

                {/* Reschedule Info */}
                {tooltip.event.resource.status === "rescheduled" && tooltip.event.resource.rescheduledBy && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-start space-x-2">
                      <RotateCcw className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900">
                          Rescheduled by: {tooltip.event.resource.rescheduledBy === "doctor" ? "You (Doctor)" : "Patient"}
                        </p>
                        {tooltip.event.resource.rescheduledAt && (
                          <p className="text-xs text-orange-700 mt-1">
                            {moment(tooltip.event.resource.rescheduledAt).format("MMM DD, YYYY h:mm A")}
                          </p>
                        )}
                        {tooltip.event.resource.originalDate && tooltip.event.resource.originalTimeSlot && (
                          <p className="text-xs text-orange-700">
                            Original: {moment(tooltip.event.resource.originalDate).format("MMM DD, YYYY")} {tooltip.event.resource.originalTimeSlot}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Reason */}
                {tooltip.event.resource.status === "cancelled" && tooltip.event.resource.cancelReason && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Cancellation Reason:</p>
                        <p className="text-sm text-red-700 mt-1 line-clamp-2">{tooltip.event.resource.cancelReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Click to view more hint */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">Click appointment for detailed actions</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}
