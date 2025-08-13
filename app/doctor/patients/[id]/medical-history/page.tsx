"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Clock,
  FileText, 
  Pill, 
  Stethoscope,
  User,
  Phone,
  Mail,
  Filter,
  TrendingUp,
  Activity,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { medicalHistoryService } from '@/services/api'
import type { MedicalHistory, AppointmentHistoryItem } from '@/types'
import toast from 'react-hot-toast'
import moment from 'moment'

export default function PatientMedicalHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '30days' | '6months' | '1year'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (params.id && user && user.role === 'doctor') {
      fetchMedicalHistory()
    }
  }, [params.id, user, startDate, endDate])

  const fetchMedicalHistory = async () => {
    try {
      const data = await medicalHistoryService.getPatientMedicalHistory(
        params.id as string,
        startDate || undefined,
        endDate || undefined
      )
      
      if (data.success) {
        setMedicalHistory(data.medicalHistory)
      } else {
        throw new Error('Failed to fetch medical history')
      }
    } catch (error) {
      console.error('Error fetching medical history:', error)
      toast.error('Failed to load medical history')
      router.push('/doctor/patients')
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilterChange = (filter: typeof dateFilter) => {
    setDateFilter(filter)
    const now = new Date()
    
    switch (filter) {
      case '30days':
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case '6months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        setStartDate(sixMonthsAgo.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case '1year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        setStartDate(oneYearAgo.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case 'all':
      default:
        setStartDate('')
        setEndDate('')
        break
    }
  }

  const handleDownloadPDF = () => {
    // In production, this would generate and download a PDF
    toast.success('Medical history PDF downloaded!')
  }

  const filteredAppointments = medicalHistory?.appointments.filter(appointment => {
    const matchesSearch = appointment.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.consultationType.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading medical history..." variant="gradient" />
      </div>
    )
  }

  if (!medicalHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center border-white/20 bg-white/90">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Medical History Not Found</h2>
          <Button onClick={() => router.push("/doctor/patients")} variant="gradient">
            Back to Patients
          </Button>
        </Card>
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
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/doctor/patients")}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700"
              >
                Back to Patients
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Medical History
                </h1>
                <p className="text-slate-600">Complete medical records for {medicalHistory.patientName}</p>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              variant="gradient"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Patient Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{medicalHistory.patientName}</h3>
                    <div className="flex items-center space-x-4 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{medicalHistory.patientEmail}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{medicalHistory.patientPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{medicalHistory.totalAppointments}</p>
                  <p className="text-slate-600 text-sm">Total Visits</p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Appointments</p>
                    <p className="text-3xl font-bold text-slate-900">{medicalHistory.totalAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">Since first visit</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Prescriptions</p>
                    <p className="text-3xl font-bold text-slate-900">{medicalHistory.totalPrescriptions}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">Medications prescribed</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Last Visit</p>
                    <p className="text-lg font-bold text-slate-900">
                      {medicalHistory.appointments.length > 0 
                        ? moment(medicalHistory.appointments[0].date).format("MMM DD, YYYY")
                        : "No visits"
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">Most recent</p>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search diagnosis, doctor, or consultation type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value as typeof dateFilter)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Medical History Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-white">
                Medical Timeline 
                {medicalHistory.dateRange && (
                  <span className="text-lg font-normal text-slate-300 ml-2">
                    ({moment(medicalHistory.dateRange.startDate).format("MMM DD, YYYY")} - {moment(medicalHistory.dateRange.endDate).format("MMM DD, YYYY")})
                  </span>
                )}
              </h3>
            </div>

            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <Card key={appointment.id} variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2"></div>
                      {index < filteredAppointments.length - 1 && (
                        <div className="w-0.5 h-20 bg-slate-300 ml-1 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {moment(appointment.date).format("MMMM DD, YYYY")}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="w-4 h-4" />
                              <span>{appointment.doctorName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{appointment.consultationType}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              appointment.status === 'completed' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {appointment.diagnosis && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Diagnosis</h5>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                            {appointment.diagnosis}
                          </p>
                        </div>
                      )}
                      
                      {appointment.prescription && (
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-3">Prescription</h5>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {appointment.prescription.medicines.map((medicine, medIndex) => (
                                <div key={medIndex} className="bg-white p-3 rounded-lg border border-slate-200">
                                  <h6 className="font-semibold text-slate-900">{medicine.name}</h6>
                                  <div className="text-sm text-slate-600 space-y-1 mt-2">
                                    <p><strong>Dosage:</strong> {medicine.dosage}</p>
                                    <p><strong>Frequency:</strong> {medicine.frequency}</p>
                                    <p><strong>Duration:</strong> {medicine.duration}</p>
                                    {medicine.notes && (
                                      <p><strong>Notes:</strong> {medicine.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {appointment.prescription.instructions && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                  <strong>Instructions:</strong> {appointment.prescription.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card variant="glass" className="p-12 text-center border-white/20 bg-white/90">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Medical Records Found</h3>
                <p className="text-slate-600">
                  {searchTerm || dateFilter !== 'all'
                    ? "No records match your current filters."
                    : "This patient doesn't have any medical history yet."}
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
