"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MapPin,
  ArrowLeft,
  Eye,
  Download,
  Edit3,
} from "lucide-react"
import { appointmentService } from "@/services/api"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export default function ConsultationsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [consultations, setConsultations] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "upcoming" | "cancelled">("all")

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        const appointmentsData = await appointmentService.getAppointments(user.id, "doctor")
        setConsultations(appointmentsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load consultations data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      searchQuery === "" ||
      consultation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.symptoms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.patientPhone.includes(searchQuery)

    const matchesFilter =
      selectedFilter === "all" ||
      consultation.status === selectedFilter ||
      (selectedFilter === "upcoming" && consultation.status === "scheduled")

    return matchesSearch && matchesFilter
  })

  const filters = [
    { key: "all", label: "All", count: consultations.length },
    { key: "upcoming", label: "Upcoming", count: consultations.filter((c) => c.status === "scheduled").length },
    { key: "completed", label: "Completed", count: consultations.filter((c) => c.status === "completed").length },
    { key: "cancelled", label: "Cancelled", count: consultations.filter((c) => c.status === "cancelled").length },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading consultations..." variant="gradient" />
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
                  Consultations 🩺
                </h1>
                <p className="text-slate-600 text-lg mt-1">Review and manage your consultations</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/doctor/calendar")}
              variant="gradient"
              size="lg"
              glow
              icon={<Calendar className="w-5 h-5" />}
            >
              Calendar View
            </Button>
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
                placeholder="Search consultations by patient name, symptoms, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400"
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="flex space-x-2 overflow-x-auto pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {filters.map((filter, index) => (
              <motion.button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedFilter === filter.key
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{filter.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedFilter === filter.key ? "bg-white/20" : "bg-slate-100"
                  }`}
                >
                  {filter.count}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Consultations List */}
      <div className="px-6 py-8">
        <AnimatePresence>
          {filteredConsultations.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-slate-100/30 to-slate-200/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-16 h-16 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No consultations found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery ? "No consultations match your search criteria" : "You haven't had any consultations yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filteredConsultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover variant="glass" glow className="p-8 border-white/20 bg-white/95">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-6 flex-1">
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-purple-100/40 to-indigo-100/40 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-200"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-xl font-bold text-slate-900">
                            {consultation.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </motion.div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-1">{consultation.patientName}</h3>
                              <p className="text-purple-600 font-semibold flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {consultation.patientPhone}
                              </p>
                              {consultation.tokenNumber && (
                                <p className="text-slate-700 text-sm mt-1">Token: {consultation.tokenNumber}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  consultation.status === "scheduled"
                                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                                    : consultation.status === "completed"
                                      ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                                      : "bg-red-500/20 text-red-600 border border-red-500/30"
                                }`}
                              >
                                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-indigo-600" />
                              <span className="text-slate-700 text-sm">{consultation.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span className="text-slate-700 text-sm">{consultation.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {consultation.consultationType === "online" ? (
                                <Video className="w-4 h-4 text-purple-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-orange-600" />
                              )}
                              <span className="text-slate-700 text-sm capitalize">{consultation.consultationType}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-600 font-semibold">₹{consultation.consultationFee}</span>
                            </div>
                          </div>

                          {consultation.symptoms && (
                            <div className="mb-4 p-3 bg-white/20 rounded-xl border border-slate-200">
                              <p className="text-slate-700 text-sm">
                                <span className="font-medium text-slate-900">Symptoms:</span> {consultation.symptoms}
                              </p>
                            </div>
                          )}

                          {consultation.prescription && (
                            <div className="mb-4 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                              <p className="text-emerald-700 text-sm">
                                <span className="font-medium text-emerald-800">Prescription:</span>{" "}
                                {consultation.prescription}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />}>
                              View Details
                            </Button>
                            {consultation.status === "completed" && (
                              <>
                                <Link href={`/doctor/prescriptions/create?appointmentId=${consultation.id}&patientId=${consultation.patientId}`}>
                                  <Button size="sm" variant="gradient" icon={<Edit3 className="w-4 h-4 bg-transparent" />}>
                                    Create Prescription
                                  </Button>
                                </Link>
                                <Button size="sm" variant="outline" icon={<Edit3 className="w-4 h-4 bg-transparent" />}>
                                  Edit Notes
                                </Button>
                                <Button size="sm" variant="success" icon={<Download className="w-4 h-4" />}>
                                  Download Report
                                </Button>
                              </>
                            )}
                            {consultation.consultationType === "online" && consultation.status === "scheduled" && (
                              <Button size="sm" variant="gradient" icon={<Video className="w-4 h-4" />}>
                                Start Video Call
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
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs">Dashboard</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-emerald-600"
            onClick={() => router.push("/doctor/patients")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Patients</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-purple-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-1">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Consultations</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-blue-600"
            onClick={() => router.push("/doctor/profile")}
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
