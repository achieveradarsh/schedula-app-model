"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  Users,
  Activity,
  Clock,
  Star,
  Video,
  MapPin,
  Stethoscope,
  User,
  LogOut,
  Bell,
  BarChart3,
  DollarSign,
} from "lucide-react"
import { appointmentService, doctorService } from "@/services/api"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

interface DoctorStats {
  totalAppointments: number
  todayAppointments: number
  completedAppointments: number
  totalPatients: number
  averageRating: number
  totalReviews: number
  monthlyEarnings: number
  pendingAppointments: number
}

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }

    const fetchDashboardData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          doctorService.getDoctorStats(user.id),
          appointmentService.getAppointments(user.id, "doctor"),
        ])

        setStats(statsData)

        // Filter today's appointments
        const today = new Date().toISOString().split("T")[0]
        const todayApts = appointmentsData.filter((apt) => apt.date === today && apt.status === "scheduled")
        setTodayAppointments(todayApts)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading dashboard..." variant="gradient" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Failed to load dashboard</h2>
          <Button onClick={() => window.location.reload()} variant="gradient">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: "from-emerald-500 to-teal-500",
      change: "+5%",
    },
    {
      title: "Completed",
      value: stats.completedAppointments.toString(),
      icon: Activity,
      color: "from-purple-500 to-indigo-500",
      change: "+8%",
    },
    {
      title: "Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "from-orange-500 to-yellow-500",
      change: "+0.2",
    },
  ]

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
                Welcome back, {user?.name?.split(" ")[1] || "Doctor"}! 👨‍⚕️
              </h1>
              <p className="text-slate-600 text-lg mt-1">Here's your practice overview for today</p>
            </motion.div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                icon={<Bell className="w-4 h-4 bg-transparent" />}
                className="relative"
              >
                Notifications
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="danger" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
                Logout
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={() => router.push("/doctor/calendar")}
              className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Calendar</span>
            </motion.button>
            <motion.button
              onClick={() => router.push("/doctor/patients")}
              className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Patients</span>
            </motion.button>
            <motion.button
              onClick={() => router.push("/doctor/consultations")}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Stethoscope className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Consultations</span>
            </motion.button>
            <motion.button
              onClick={() => router.push("/doctor/profile")}
              className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl text-white hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Profile</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card hover variant="glass" glow className="p-6 border-white/20 bg-white/95">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-emerald-600 text-sm font-semibold">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-slate-600 text-sm">{stat.title}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Today's Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card variant="glass" className="p-8 border-white/20 bg-white/95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-indigo-600" />
                Today's Appointments ({todayAppointments.length})
              </h2>
              <Button onClick={() => router.push("/doctor/calendar")} variant="gradient" size="sm" glow>
                View Calendar
              </Button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-100/30 to-slate-200/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No appointments today</h3>
                <p className="text-slate-600">Enjoy your free day!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-white/20 rounded-2xl border border-slate-200 hover:bg-white/30 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold">
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{appointment.patientName}</h4>
                        <p className="text-slate-600 text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {appointment.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {appointment.consultationType === "online" ? (
                          <Video className="w-4 h-4 text-purple-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-slate-700 text-sm capitalize">{appointment.consultationType}</span>
                      </div>
                      <span className="text-emerald-600 font-semibold">₹{appointment.consultationFee}</span>
                    </div>
                  </motion.div>
                ))}
                {todayAppointments.length > 5 && (
                  <div className="text-center pt-4">
                    <Button onClick={() => router.push("/doctor/calendar")} variant="outline" size="sm">
                      View All {todayAppointments.length} Appointments
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass" className="p-6 border-white/20 bg-white/95">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
              This Month's Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Total Consultations</span>
                <span className="text-slate-900 font-semibold">{stats.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Success Rate</span>
                <span className="text-emerald-600 font-semibold">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Patient Satisfaction</span>
                <span className="text-yellow-600 font-semibold">{stats.averageRating}/5.0</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6 border-white/20 bg-white/95">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Earnings Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">This Month</span>
                <span className="text-green-600 font-semibold">
                  ₹{(stats.totalAppointments * 1000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Average per Consultation</span>
                <span className="text-slate-900 font-semibold">₹1,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Growth</span>
                <span className="text-emerald-600 font-semibold">+15%</span>
              </div>
            </div>
          </Card>
        </motion.div>
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
            className="flex flex-col items-center py-2 text-indigo-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Dashboard</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-emerald-600"
            onClick={() => router.push("/doctor/patients")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all duration-200">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs">Patients</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-purple-600"
            onClick={() => router.push("/doctor/consultations")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200">
              <Stethoscope className="w-4 h-4" />
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
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
