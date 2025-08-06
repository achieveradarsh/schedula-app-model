"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Printer, 
  User, 
  Phone, 
  Calendar, 
  Clock,
  FileText, 
  Pill, 
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Share2,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import { prescriptionService } from "@/services/api"
import type { Prescription } from "@/types"
import toast from "react-hot-toast"
import moment from "moment"

export default function ViewPrescriptionPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "doctor") {
      router.push("/")
      return
    }
    fetchPrescription()
  }, [user, router, params.id])

  const fetchPrescription = async () => {
    try {
      const data = await prescriptionService.getPrescriptionById(params.id as string)
      setPrescription(data)
    } catch (error) {
      console.error("Failed to fetch prescription:", error)
      toast.error("Failed to load prescription")
      router.push("/doctor/prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
    toast.success("Print dialog opened")
  }

  const handleDownloadPDF = () => {
    // In a real app, you would generate and download a PDF
    toast.success("PDF download feature will be implemented")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription for ${prescription?.patientName}`,
          text: `Prescription details for ${prescription?.patientName}`,
          url: window.location.href,
        })
        toast.success("Prescription shared successfully")
      } catch (error) {
        // User cancelled the share or sharing failed
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Prescription link copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy link")
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
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading prescription..." variant="gradient" />
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center border-white/20 bg-white/90">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Prescription Not Found</h2>
          <Button onClick={() => router.push("/doctor/prescriptions")} variant="gradient">
            Back to Prescriptions
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-24">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl shadow-2xl border-b border-white/20 print:bg-white print:shadow-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700 print:hidden"
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent print:text-slate-900">
                  Prescription Details
                </h1>
                <p className="text-slate-600">Patient: {prescription.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 print:hidden">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
              >
                Print
              </Button>
              <Button
                onClick={() => router.push(`/doctor/prescriptions/${prescription.id}/edit`)}
                variant="gradient"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prescription Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Prescription Header */}
            <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl mb-8 print:bg-white print:border-slate-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center print:bg-slate-100">
                    <FileText className="w-8 h-8 text-indigo-600 print:text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Medical Prescription</h2>
                    <p className="text-slate-600">ID: {prescription.id}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(prescription.status)}`}>
                  {getStatusIcon(prescription.status)}
                  <span className="capitalize">{prescription.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>Patient Information</span>
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {prescription.patientName}</p>
                    <p><span className="font-medium">Phone:</span> {prescription.patientPhone}</p>
                    <p><span className="font-medium">Patient ID:</span> {prescription.patientId}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>Prescription Details</span>
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Appointment Date:</span> {moment(prescription.appointmentDate).format("MMMM DD, YYYY")}</p>
                    <p><span className="font-medium">Created:</span> {moment(prescription.createdAt).format("MMMM DD, YYYY, h:mm A")}</p>
                    <p><span className="font-medium">Appointment ID:</span> {prescription.appointmentId}</p>
                    {prescription.followUpDate && (
                      <p><span className="font-medium">Follow-up Date:</span> {moment(prescription.followUpDate).format("MMMM DD, YYYY")}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl mb-8 print:bg-white print:border-slate-300">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <span>Diagnosis</span>
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 print:bg-slate-100">
                  <p className="text-slate-800 leading-relaxed">{prescription.diagnosis}</p>
                </div>
              </Card>
            )}

            {/* Medicines */}
            <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl mb-8 print:bg-white print:border-slate-300">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <span>Prescribed Medicines ({prescription.medicines.length})</span>
              </h3>
              <div className="space-y-4">
                {prescription.medicines.map((medicine, index) => (
                  <motion.div
                    key={medicine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-2 border-slate-200 rounded-xl p-6 bg-white print:border-slate-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                          {index + 1}. {medicine.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="font-semibold text-slate-600">Dosage:</span>
                            <p className="text-slate-900">{medicine.dosage}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-600">Frequency:</span>
                            <p className="text-slate-900">{medicine.frequency}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-600">Duration:</span>
                            <p className="text-slate-900">{medicine.duration}</p>
                          </div>
                        </div>
                        {medicine.notes && (
                          <div className="mt-3">
                            <span className="font-semibold text-slate-600">Notes:</span>
                            <p className="text-slate-800 bg-yellow-50 p-2 rounded-lg mt-1 print:bg-yellow-100">
                              {medicine.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Instructions */}
            {prescription.instructions && (
              <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl mb-8 print:bg-white print:border-slate-300">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>General Instructions</span>
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 print:bg-blue-100">
                  <p className="text-slate-800 leading-relaxed">{prescription.instructions}</p>
                </div>
              </Card>
            )}

            {/* Doctor's Signature */}
            <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl print:bg-white print:border-slate-300">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Last Updated:</p>
                  <p className="font-medium text-slate-900">
                    {moment(prescription.updatedAt).format("MMMM DD, YYYY, h:mm A")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="mb-8">
                    <div className="w-48 border-b-2 border-slate-300"></div>
                  </div>
                  <p className="font-bold text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-600">Doctor</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .print\\:bg-slate-100 {
            background-color: #f1f5f9 !important;
          }
          .print\\:bg-blue-100 {
            background-color: #dbeafe !important;
          }
          .print\\:bg-yellow-100 {
            background-color: #fef3c7 !important;
          }
          .print\\:text-slate-900 {
            color: #0f172a !important;
          }
          .print\\:text-slate-600 {
            color: #475569 !important;
          }
        }
      `}</style>
    </div>
  )
}
