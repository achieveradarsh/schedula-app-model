"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Phone, Mail, Calendar, Activity, ArrowLeft, Eye, MessageCircle, FileText } from "lucide-react"
import { appointmentService } from "@/services/api"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

interface Patient {
  id: string
  name: string
  phone: string
  email: string
  lastVisit: string
  totalAppointments: number
  status: "active" | "inactive"
  age: number
  bloodGroup: string
  conditions: string[]
}

export default function PatientsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        const appointmentsData = await appointmentService.getAppointments(user.id, "doctor")
        setAppointments(appointmentsData)

        // Extract unique patients from appointments
        const uniquePatients = new Map<string, Patient>()

        appointmentsData.forEach((apt) => {
          if (!uniquePatients.has(apt.patientId)) {
            uniquePatients.set(apt.patientId, {
              id: apt.patientId,
              name: apt.patientName,
              phone: apt.patientPhone,
              email: `${apt.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
              lastVisit: apt.date,
              totalAppointments: appointmentsData.filter((a) => a.patientId === apt.patientId).length,
              status: new Date(apt.date) > new Date() ? "active" : "inactive",
              age: Math.floor(Math.random() * 40) + 25,
              bloodGroup: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][Math.floor(Math.random() * 8)],
              conditions: ["Hypertension", "Diabetes", "Asthma", "Allergies"].slice(
                0,
                Math.floor(Math.random() * 3) + 1,
              ),
            })
          }
        })

        setPatients(Array.from(uniquePatients.values()))
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load patients data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = selectedFilter === "all" || patient.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  const filters = [
    { key: "all", label: "All Patients", count: patients.length },
    { key: "active", label: "Active", count: patients.filter((p) => p.status === "active").length },
    { key: "inactive", label: "Inactive", count: patients.filter((p) => p.status === "inactive").length },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading patients..." variant="gradient" />
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
                  My Patients 👥
                </h1>
                <p className="text-slate-600 text-lg mt-1">Manage your patient relationships</p>
              </div>
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
                placeholder="Search patients by name, phone, or email..."
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
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
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

      {/* Patients List */}
      <div className="px-6 py-8">
        <AnimatePresence>
          {filteredPatients.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-slate-100/30 to-slate-200/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-16 h-16 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No patients found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery ? "No patients match your search criteria" : "You haven't seen any patients yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover variant="glass" glow className="p-6 border-white/20 bg-white/95">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                          <p className="text-slate-600 text-sm">
                            {patient.age} years • {patient.bloodGroup}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          patient.status === "active"
                            ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                            : "bg-slate-500/20 text-slate-600 border border-slate-500/30"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-slate-700 text-sm">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 text-sm">
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 text-sm">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <span>{patient.totalAppointments} appointments</span>
                      </div>
                    </div>

                    {patient.conditions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-slate-900 text-sm font-medium mb-2">Conditions:</p>
                        <div className="flex flex-wrap gap-1">
                          {patient.conditions.map((condition, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/20 rounded-lg text-xs text-slate-700 border border-slate-200">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />}>
                        View History
                      </Button>
                      <Button size="sm" variant="outline" icon={<MessageCircle className="w-4 h-4 bg-transparent" />}>
                        Message
                      </Button>
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
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs">Dashboard</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-emerald-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Patients</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-purple-600"
            onClick={() => router.push("/doctor/consultations")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs">Consultations</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-blue-600"
            onClick={() => router.push("/doctor/profile")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all duration-200">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
