"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Minus, 
  ArrowLeft, 
  Save, 
  User, 
  Calendar, 
  Pill, 
  FileText, 
  Stethoscope,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import { prescriptionService } from "@/services/api"
import type { Medicine, Prescription } from "@/types"
import { useForm, useFieldArray } from "react-hook-form"
import toast from "react-hot-toast"
import moment from "moment"

interface PrescriptionEditForm {
  diagnosis: string
  instructions: string
  medicines: Medicine[]
  followUpDate?: string
}

export default function EditPrescriptionPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [prescription, setPrescription] = useState<Prescription | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PrescriptionEditForm>()

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "medicines"
  })

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
      
      // Populate form with existing data
      reset({
        diagnosis: data.diagnosis || "",
        instructions: data.instructions || "",
        medicines: data.medicines || [],
        followUpDate: data.followUpDate || ""
      })
    } catch (error) {
      console.error("Failed to fetch prescription:", error)
      toast.error("Failed to load prescription")
      router.push("/doctor/prescriptions")
    } finally {
      setFetchLoading(false)
    }
  }

  const addMedicine = () => {
    append({
      id: `med_${Date.now()}`,
      name: "",
      dosage: "",
      duration: "",
      frequency: "",
      notes: ""
    })
  }

  const removeMedicine = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: PrescriptionEditForm) => {
    try {
      setLoading(true)

      const updates = {
        ...data,
        medicines: data.medicines.map((medicine, index) => ({
          ...medicine,
          id: medicine.id || `med_${Date.now()}_${index}`
        }))
      }

      await prescriptionService.updatePrescription(params.id as string, updates)
      toast.success("Prescription updated successfully!")
      router.push(`/doctor/prescriptions/${params.id}`)
    } catch (error) {
      console.error("Failed to update prescription:", error)
      toast.error("Failed to update prescription")
    } finally {
      setLoading(false)
    }
  }

  const frequencyOptions = [
    "Once a day",
    "Twice a day", 
    "Three times a day",
    "Four times a day",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime"
  ]

  const durationOptions = [
    "3 days",
    "5 days", 
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "30 days",
    "Until finished",
    "Continue as prescribed"
  ]

  if (fetchLoading) {
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
        className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl shadow-2xl border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="hover:bg-slate-100 text-slate-700"
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Edit Prescription
              </h1>
              <p className="text-slate-600">Update prescription for {prescription.patientName}</p>
            </div>
          </div>

          {/* Patient Info Display */}
          <Card variant="glass" className="p-6 border-white/20 bg-white/90">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Patient</label>
                <p className="text-lg font-semibold text-slate-900">{prescription.patientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Appointment Date</label>
                <p className="text-lg font-semibold text-slate-900">
                  {moment(prescription.appointmentDate).format("MMM DD, YYYY")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Prescription ID</label>
                <p className="text-lg font-semibold text-slate-900">{prescription.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Form */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
              {/* Diagnosis & Instructions */}
              <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Diagnosis & Instructions</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Diagnosis *
                    </label>
                    <textarea
                      {...register("diagnosis", { required: "Diagnosis is required" })}
                      placeholder="Enter the diagnosis..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400 resize-none"
                    />
                    {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      General Instructions
                    </label>
                    <textarea
                      {...register("instructions")}
                      placeholder="Enter general instructions for the patient..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Follow-up Date (Optional)
                    </label>
                    <Input
                      type="date"
                      min={moment().add(1, "day").format("YYYY-MM-DD")}
                      {...register("followUpDate")}
                      icon={<Calendar className="w-5 h-5" />}
                    />
                  </div>
                </div>
              </Card>

              {/* Medicines */}
              <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Medicines</h2>
                  </div>
                  <Button
                    type="button"
                    onClick={addMedicine}
                    variant="outline"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Medicine
                  </Button>
                </div>

                <div className="space-y-6">
                  <AnimatePresence>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 border-2 border-slate-200 rounded-xl bg-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Medicine {index + 1}
                          </h3>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              variant="outline"
                              size="sm"
                              icon={<Minus className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Medicine Name *
                            </label>
                            <Input
                              placeholder="e.g., Paracetamol 500mg"
                              {...register(`medicines.${index}.name`, { required: "Medicine name is required" })}
                              error={errors.medicines?.[index]?.name?.message}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Dosage *
                            </label>
                            <Input
                              placeholder="e.g., 1 tablet, 5ml"
                              {...register(`medicines.${index}.dosage`, { required: "Dosage is required" })}
                              error={errors.medicines?.[index]?.dosage?.message}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Frequency *
                            </label>
                            <select
                              {...register(`medicines.${index}.frequency`, { required: "Frequency is required" })}
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                            >
                              <option value="">Select frequency...</option>
                              {frequencyOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {errors.medicines?.[index]?.frequency && (
                              <p className="text-red-500 text-sm mt-1">{errors.medicines[index]?.frequency?.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Duration *
                            </label>
                            <select
                              {...register(`medicines.${index}.duration`, { required: "Duration is required" })}
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                            >
                              <option value="">Select duration...</option>
                              {durationOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {errors.medicines?.[index]?.duration && (
                              <p className="text-red-500 text-sm mt-1">{errors.medicines[index]?.duration?.message}</p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Additional Notes
                            </label>
                            <Input
                              placeholder="e.g., Take after meals, avoid alcohol"
                              {...register(`medicines.${index}.notes`)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>

              {/* Update Confirmation */}
              <Card variant="glass" className="p-6 border-orange-200 bg-orange-50/95 backdrop-blur-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">Important Notice</h3>
                    <p className="text-orange-800 text-sm">
                      You are updating an existing prescription. This action will modify the prescription details 
                      and update the last modified timestamp. Make sure all changes are accurate before saving.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  glow
                  disabled={loading}
                  icon={loading ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                >
                  {loading ? "Updating..." : "Update Prescription"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
