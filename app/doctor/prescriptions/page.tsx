"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Pill, 
  Clock,
  Eye,
  Edit,
  Trash2,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  MoreVertical,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import { prescriptionService } from "@/services/api"
import type { Prescription } from "@/types"
import toast from "react-hot-toast"
import moment from "moment"

interface FilterOptions {
  status: "all" | "active" | "completed" | "cancelled"
  dateRange: "all" | "today" | "week" | "month"
  patient: string
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateRange: "all",
    patient: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }
    fetchPrescriptions()
  }, [user, router])

  useEffect(() => {
    applyFilters()
  }, [prescriptions, searchQuery, filters])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const data = await prescriptionService.getPrescriptions(user!.id)
      setPrescriptions(data)
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error)
      toast.error("Failed to load prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...prescriptions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(prescription => 
        prescription.patientName.toLowerCase().includes(query) ||
        prescription.diagnosis?.toLowerCase().includes(query) ||
        prescription.medicines.some(med => 
          med.name.toLowerCase().includes(query)
        )
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(prescription => prescription.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = moment()
      filtered = filtered.filter(prescription => {
        const prescriptionDate = moment(prescription.createdAt)
        switch (filters.dateRange) {
          case "today":
            return prescriptionDate.isSame(now, "day")
          case "week":
            return prescriptionDate.isAfter(now.clone().subtract(7, "days"))
          case "month":
            return prescriptionDate.isAfter(now.clone().subtract(30, "days"))
          default:
            return true
        }
      })
    }

    // Patient filter
    if (filters.patient) {
      filtered = filtered.filter(prescription => 
        prescription.patientName.toLowerCase().includes(filters.patient.toLowerCase())
      )
    }

    setFilteredPrescriptions(filtered)
  }

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      await prescriptionService.deletePrescription(prescriptionId)
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId))
      toast.success("Prescription deleted successfully")
      setShowDeleteModal(false)
      setSelectedPrescription(null)
    } catch (error) {
      console.error("Failed to delete prescription:", error)
      toast.error("Failed to delete prescription")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter(p => p.status === "active").length,
    completed: prescriptions.filter(p => p.status === "completed").length,
    thisWeek: prescriptions.filter(p => 
      moment(p.createdAt).isAfter(moment().subtract(7, "days"))
    ).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading prescriptions..." variant="gradient" />
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
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/doctor/dashboard")}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="hover:bg-slate-100 text-slate-700"
            >
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Prescription Management
              </h1>
              <p className="text-slate-600 mt-2">Create and manage patient prescriptions</p>
            </div>
            <Button
              onClick={() => router.push("/doctor/prescriptions/create")}
              variant="gradient"
              size="lg"
              glow
              icon={<Plus className="w-5 h-5" />}
            >
              New Prescription
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-600">Total Prescriptions</p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                  <p className="text-sm text-slate-600">Active Prescriptions</p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
                  <p className="text-sm text-slate-600">This Week</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by patient name, diagnosis, or medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              icon={<Filter className="w-5 h-5" />}
            >
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Patient</label>
                      <Input
                        placeholder="Filter by patient name..."
                        value={filters.patient}
                        onChange={(e) => setFilters(prev => ({ ...prev, patient: e.target.value }))}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Prescriptions List */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredPrescriptions.length === 0 ? (
            <Card variant="glass" className="p-12 text-center border-white/20 bg-white/90">
              <Stethoscope className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Prescriptions Found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || filters.status !== "all" || filters.dateRange !== "all" || filters.patient
                  ? "No prescriptions match your search criteria"
                  : "You haven't created any prescriptions yet"}
              </p>
              <Button
                onClick={() => router.push("/doctor/prescriptions/create")}
                variant="gradient"
                icon={<Plus className="w-5 h-5" />}
              >
                Create First Prescription
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredPrescriptions.map((prescription) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="glass" className="p-6 border-white/20 bg-white/95 hover:bg-white transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900">{prescription.patientName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{moment(prescription.appointmentDate).format("MMM DD, YYYY")}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{moment(prescription.createdAt).format("h:mm A")}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>ID: {prescription.appointmentId}</span>
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            <span className="capitalize">{prescription.status}</span>
                          </div>
                        </div>

                        {prescription.diagnosis && (
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Stethoscope className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-900">Diagnosis:</span>
                            </div>
                            <p className="text-slate-700 ml-6">{prescription.diagnosis}</p>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Pill className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900">Medicines ({prescription.medicines.length}):</span>
                          </div>
                          <div className="grid gap-2 ml-6">
                            {prescription.medicines.slice(0, 3).map((medicine) => (
                              <div key={medicine.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-slate-900">{medicine.name}</p>
                                  <p className="text-sm text-slate-600">
                                    {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {prescription.medicines.length > 3 && (
                              <p className="text-sm text-slate-500 ml-3">
                                +{prescription.medicines.length - 3} more medicines
                              </p>
                            )}
                          </div>
                        </div>

                        {prescription.instructions && (
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-slate-900">Instructions:</span>
                            </div>
                            <p className="text-slate-700 ml-6 line-clamp-2">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => router.push(`/doctor/prescriptions/${prescription.id}`)}
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => router.push(`/doctor/prescriptions/${prescription.id}/edit`)}
                          variant="outline"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPrescription(prescription)
                            setShowDeleteModal(true)
                          }}
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPrescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Prescription</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete the prescription for{" "}
                <span className="font-semibold">{selectedPrescription.patientName}</span>?
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedPrescription(null)
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeletePrescription(selectedPrescription.id)}
                  variant="gradient"
                  className="bg-gradient-to-r from-red-500 to-red-600"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
