"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
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
  Copy,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import { prescriptionService } from "@/services/api"
import type { Prescription } from "@/types"
import toast from "react-hot-toast"
import moment from "moment"

export default function PatientPrescriptionViewPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const prescriptionData = await prescriptionService.getPrescriptionById(params.id as string)
        
        // Verify this prescription belongs to the current patient
        if (prescriptionData.patientId !== user?.id && user?.role === "patient") {
          toast.error("You can only view your own prescriptions")
          router.push("/records")
          return
        }
        
        setPrescription(prescriptionData)
      } catch (error) {
        console.error("Failed to fetch prescription:", error)
        toast.error("Failed to load prescription details")
        router.push("/records")
      } finally {
        setLoading(false)
      }
    }

    if (params.id && user) {
      fetchPrescription()
    }
  }, [params.id, user, router])

  const handlePrint = () => {
    window.print()
    toast.success("Print dialog opened")
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    toast.success("Prescription downloaded!")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription from ${prescription?.doctorName}`,
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
        return "text-emerald-700 bg-emerald-100 border-emerald-200"
      case "completed":
        return "text-blue-700 bg-blue-100 border-blue-200"
      case "cancelled":
        return "text-red-700 bg-red-100 border-red-200"
      default:
        return "text-slate-700 bg-slate-100 border-slate-200"
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
          <Button onClick={() => router.push("/records")} variant="gradient">
            Back to Records
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
                onClick={() => router.push("/records")}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700 print:hidden"
              >
                Back to Records
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent print:text-slate-900">
                  Prescription Details
                </h1>
                <p className="text-slate-600">From {prescription.doctorName}</p>
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
                onClick={handlePrint}
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
              >
                Print
              </Button>
              <Button
                onClick={handleDownload}
                variant="gradient"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Download PDF
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(prescription.status)}`}>
              {getStatusIcon(prescription.status)}
              <span className="text-sm font-semibold capitalize">{prescription.status}</span>
            </div>
            <span className="text-slate-500 text-sm">
              • Created {moment(prescription.createdAt).format("MMM DD, YYYY")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Prescription Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Patient & Doctor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Patient Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 font-medium">{prescription.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{prescription.patientPhone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{moment(prescription.appointmentDate).format("MMM DD, YYYY")}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Doctor Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Prescribed By</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 font-medium">{prescription.doctorName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{moment(prescription.createdAt).format("MMM DD, YYYY [at] hh:mm A")}</span>
                  </div>
                  {prescription.followUpDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700">Follow-up: {moment(prescription.followUpDate).format("MMM DD, YYYY")}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Diagnosis</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">{prescription.diagnosis}</p>
              </Card>
            </motion.div>
          )}

          {/* Medicines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Prescribed Medicines</h3>
              </div>
              <div className="space-y-4">
                {prescription.medicines.map((medicine, index) => (
                  <div
                    key={medicine.id || index}
                    className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-slate-900 text-lg">{medicine.name}</h4>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {medicine.duration}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block">Dosage:</span>
                        <span className="text-slate-900 font-medium">{medicine.dosage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Frequency:</span>
                        <span className="text-slate-900 font-medium">{medicine.frequency}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Duration:</span>
                        <span className="text-slate-900 font-medium">{medicine.duration}</span>
                      </div>
                    </div>
                    {medicine.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 text-sm">
                          <strong>Note:</strong> {medicine.notes}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Instructions */}
          {prescription.instructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Additional Instructions</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">{prescription.instructions}</p>
              </Card>
            </motion.div>
          )}

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="print:break-inside-avoid"
          >
            <Card variant="glass" className="p-6 border-amber-200 bg-amber-50/90">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 mb-2">Important Notice</h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    This prescription is valid for the medicines mentioned above. Please follow the dosage and 
                    frequency as prescribed. Consult your doctor if you experience any side effects or if your 
                    condition doesn't improve. Do not share this medicine with others.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
