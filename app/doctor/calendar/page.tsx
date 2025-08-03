"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar as BigCalendar, momentLocalizer, Views, type View } from "react-big-calendar"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import moment from "moment"
import { ArrowLeft, Plus, Filter, Clock, User, Video, MapPin, XCircle, CheckCircle } from "lucide-react"
import { appointmentService } from "@/services/api"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CancelReasonModal } from "@/components/CancelReasonModal"
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

export default function DoctorCalendarPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    appointment: Appointment | null
  }>({ isOpen: false, appointment: null })

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }

    const fetchAppointments = async () => {
      try {
        const appointmentsData = await appointmentService.getAppointments(user.id, "doctor")
        setAppointments(appointmentsData)

        // Convert appointments to calendar events
        const calendarEvents: CalendarEvent[] = appointmentsData.map((apt) => {
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

        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
        toast.error("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, router])

  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      const newDate = moment(start).format("YYYY-MM-DD")
      const newTimeSlot = `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`

      // Update the appointment
      await appointmentService.rescheduleAppointment(event.id, newDate, newTimeSlot)

      // Update local state
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === event.id
            ? {
                ...evt,
                start,
                end,
                resource: {
                  ...evt.resource,
                  date: newDate,
                  timeSlot: newTimeSlot,
                },
              }
            : evt,
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

      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === event.id
            ? {
                ...evt,
                start,
                end,
                resource: {
                  ...evt.resource,
                  date: newDate,
                  timeSlot: newTimeSlot,
                },
              }
            : evt,
        ),
      )

      toast.success("Appointment time updated successfully!")
    } catch (error) {
      console.error("Failed to update appointment time:", error)
      toast.error("Failed to update appointment time")
    }
  }, [])

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleCancelAppointment = async (reason?: string) => {
    if (!cancelModal.appointment) return

    try {
      await appointmentService.updateAppointmentStatus(cancelModal.appointment.id, "cancelled", reason)

      // Remove from calendar
      setEvents((prevEvents) => prevEvents.filter((evt) => evt.id !== cancelModal.appointment!.id))

      toast.success("Appointment cancelled successfully")
      setCancelModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, "completed")

      // Update event color/style
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === appointmentId
            ? {
                ...evt,
                resource: { ...evt.resource, status: "completed" },
                isDraggable: false,
              }
            : evt,
        ),
      )

      toast.success("Appointment marked as completed")
      setShowEventDetails(false)
    } catch (error) {
      console.error("Failed to complete appointment:", error)
      toast.error("Failed to complete appointment")
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
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
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
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Appointment Calendar 📅
                  </h1>
                  <p className="text-slate-600 text-lg mt-1">Drag and drop to reschedule appointments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4 bg-transparent" />}>
                  Filter
                </Button>
                <Button variant="gradient" size="lg" glow icon={<Plus className="w-5 h-5" />}>
                  New Appointment
                </Button>
              </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {[Views.MONTH, Views.WEEK, Views.DAY].map((viewName) => (
                  <button
                    key={viewName}
                    onClick={() => setView(viewName)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      view === viewName
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-white/80 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-slate-600 font-medium">{moment(date).format("MMMM YYYY")}</div>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <div className="p-6">
          <Card variant="glass" className="p-6 border-white/20">
            <div style={{ height: "600px" }}>
              <DragAndDropCalendar
                localizer={localizer}
                events={events}
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
                tooltipAccessor={(event: CalendarEvent) =>
                  `${event.resource.patientName} - ${event.resource.symptoms || "Consultation"}`
                }
                components={{
                  event: ({ event }: { event: CalendarEvent }) => (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{event.title}</span>
                      {event.resource.consultationType === "online" && <Video className="w-3 h-3 ml-1" />}
                    </div>
                  ),
                }}
                formats={{
                  timeGutterFormat: "h:mm A",
                  eventTimeRangeFormat: ({ start, end }) =>
                    `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Appointment Details</h3>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{selectedEvent.resource.patientName}</p>
                    <p className="text-sm text-slate-600">{selectedEvent.resource.patientPhone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{selectedEvent.resource.timeSlot}</p>
                    <p className="text-sm text-slate-600">{selectedEvent.resource.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedEvent.resource.consultationType === "online" ? (
                    <Video className="w-5 h-5 text-purple-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-orange-600" />
                  )}
                  <p className="font-semibold text-slate-900 capitalize">
                    {selectedEvent.resource.consultationType} Consultation
                  </p>
                </div>

                {selectedEvent.resource.symptoms && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Symptoms:</span> {selectedEvent.resource.symptoms}
                    </p>
                  </div>
                )}
              </div>

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
                  selectedEvent.resource.status === "scheduled" && (
                    <Button size="sm" variant="secondary" icon={<Video className="w-4 h-4" />}>
                      Join Call
                    </Button>
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
      </div>
    </DndProvider>
  )
}
