"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Calendar, Clock, User, Phone, FileText, Upload, CreditCard, CheckCircle } from "lucide-react"
import { doctorService, appointmentService } from "@/services/api"
import type { Doctor, Appointment } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { BookingProgress } from "@/components/BookingProgress"
import { PaymentInvoice } from "@/components/PaymentInvoice"
import { PaymentProcessing } from "@/components/PaymentProcessing"
import { useAuthStore } from "@/store/authStore"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

interface BookingForm {
  patientName: string
  patientPhone: string
  symptoms: string
  date: string
  timeSlot: string
  consultationType: "online" | "offline"
  medicalDocuments?: FileList
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingForm>()

  const watchedDate = watch("date")

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorData = await doctorService.getDoctorById(params.id as string)
        setDoctor(doctorData)

        // Pre-fill patient details if user is logged in
        if (user) {
          setValue("patientName", user.name)
          setValue("patientPhone", user.phone)
        }
      } catch (error) {
        console.error("Failed to fetch doctor:", error)
        toast.error("Failed to load doctor details")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDoctor()
    }
  }, [params.id, user, setValue, router])

  useEffect(() => {
    if (watchedDate && doctor) {
      fetchAvailableSlots(watchedDate)
    }
  }, [watchedDate, doctor])

  const fetchAvailableSlots = async (date: string) => {
    try {
      const slots = await appointmentService.getAvailableSlots(doctor!.id, date)
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Failed to fetch slots:", error)
      toast.error("Failed to load available slots")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    toast.success(`${files.length} file(s) uploaded successfully`)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: BookingForm) => {
    if (!doctor) return

    setShowPaymentProcessing(true)
  }

  const handlePaymentComplete = async () => {
    try {
      const formData = watch()

      const appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt"> = {
        doctorId: doctor!.id,
        patientId: user?.id || "guest",
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        date: formData.date,
        timeSlot: formData.timeSlot,
        status: "scheduled",
        symptoms: formData.symptoms,
        consultationFee: doctor!.consultationFee,
        consultationType: formData.consultationType,
        tokenNumber: `T${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        paymentStatus: "completed",
        medicalDocuments: uploadedFiles.map((file) => file.name),
      }

      const appointment = await appointmentService.createAppointment(appointmentData)

      // Navigate to success page with appointment details
      const searchParams = new URLSearchParams({
        appointmentId: appointment.id,
        doctor: doctor!.name,
        date: appointment.date,
        time: appointment.timeSlot,
        token: appointment.tokenNumber,
        fee: appointment.consultationFee.toString(),
      })

      router.push(`/appointment-success?${searchParams.toString()}`)
    } catch (error) {
      console.error("Failed to create appointment:", error)
      toast.error("Failed to book appointment. Please try again.")
      setShowPaymentProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading booking details..." variant="gradient" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center border-white/20 bg-white/90">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Doctor not found</h2>
          <Button onClick={() => router.back()} variant="gradient">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  if (showPaymentProcessing) {
    return (
      <PaymentProcessing
        onComplete={handlePaymentComplete}
        doctorName={doctor.name}
        appointmentDate={watch("date")}
        appointmentTime={watch("timeSlot")}
        amount={doctor.consultationFee}
      />
    )
  }

  const steps = [
    { step: 1, title: "Patient Details", completed: currentStep > 1 },
    { step: 2, title: "Date & Time", completed: currentStep > 2 },
    { step: 3, title: "Medical Documents", completed: currentStep > 3 },
    { step: 4, title: "Payment", completed: false },
  ]

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
                Book Appointment
              </h1>
              <p className="text-slate-600">Schedule your consultation with {doctor.name}</p>
            </div>
          </div>

          {/* Doctor Info */}
          <Card variant="gradient" className="p-6 mb-6 bg-white shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
                <p className="text-indigo-600 font-semibold">{doctor.specialization}</p>
                <p className="text-sm text-slate-600">{doctor.location}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee}</p>
                <p className="text-sm text-slate-500">Consultation Fee</p>
              </div>
            </div>
          </Card>

          {/* Progress */}
          <BookingProgress steps={steps} />
        </div>
      </motion.div>

      {/* Booking Form */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Patient Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Patient Details</h2>
                    </div>

                    <div className="space-y-6">
                      <Input
                        label="Full Name"
                        placeholder="Enter patient's full name"
                        icon={<User className="w-5 h-5" />}
                        {...register("patientName", { required: "Patient name is required" })}
                        error={errors.patientName?.message}
                      />

                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter phone number"
                        icon={<Phone className="w-5 h-5" />}
                        {...register("patientPhone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Please enter a valid 10-digit phone number",
                          },
                        })}
                        error={errors.patientPhone?.message}
                      />

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Describe your symptoms
                        </label>
                        <textarea
                          {...register("symptoms", { required: "Please describe your symptoms" })}
                          placeholder="Please describe your symptoms, concerns, or reason for consultation..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400 resize-none"
                        />
                        {errors.symptoms && <p className="text-red-500 text-sm mt-1">{errors.symptoms.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Consultation Type</label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="relative">
                            <input
                              type="radio"
                              value="offline"
                              {...register("consultationType", { required: "Please select consultation type" })}
                              className="sr-only"
                            />
                            <div className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all duration-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <User className="w-4 h-4 text-orange-600" />
                                </div>
                                <p className="font-semibold text-slate-900">In-Person</p>
                                <p className="text-sm text-slate-600">Visit clinic</p>
                              </div>
                            </div>
                          </label>
                          <label className="relative">
                            <input
                              type="radio"
                              value="online"
                              {...register("consultationType", { required: "Please select consultation type" })}
                              className="sr-only"
                            />
                            <div className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all duration-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <Phone className="w-4 h-4 text-purple-600" />
                                </div>
                                <p className="font-semibold text-slate-900">Online</p>
                                <p className="text-sm text-slate-600">Video call</p>
                              </div>
                            </div>
                          </label>
                        </div>
                        {errors.consultationType && (
                          <p className="text-red-500 text-sm mt-1">{errors.consultationType.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button type="button" onClick={() => setCurrentStep(2)} variant="gradient" size="lg" glow>
                        Continue to Date & Time →
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Select Date & Time</h2>
                    </div>

                    <div className="space-y-6">
                      <Input
                        label="Appointment Date"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        icon={<Calendar className="w-5 h-5" />}
                        {...register("date", { required: "Please select a date" })}
                        error={errors.date?.message}
                      />

                      {availableSlots.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Available Time Slots
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableSlots.map((slot) => (
                              <label key={slot} className="relative">
                                <input
                                  type="radio"
                                  value={slot}
                                  {...register("timeSlot", { required: "Please select a time slot" })}
                                  className="sr-only"
                                />
                                <div className="p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-all duration-200 text-center peer-checked:border-emerald-500 peer-checked:bg-emerald-50">
                                  <Clock className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                                  <p className="text-sm font-semibold text-slate-900">{slot}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot.message}</p>}
                        </div>
                      )}

                      {watchedDate && availableSlots.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600">No available slots for this date</p>
                          <p className="text-sm text-slate-500">Please select a different date</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={() => setCurrentStep(1)} variant="outline" size="lg">
                        ← Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        variant="gradient"
                        size="lg"
                        glow
                        disabled={!watch("date") || !watch("timeSlot")}
                      >
                        Continue to Documents →
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Medical Documents */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Medical Documents</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-slate-600 mb-4">
                          Upload any relevant medical documents, reports, or prescriptions (Optional)
                        </p>

                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileUpload}
                            className="sr-only"
                          />
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-indigo-400 transition-all duration-200">
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-700 font-semibold mb-2">Click to upload files</p>
                            <p className="text-sm text-slate-500">Supports PDF, JPG, PNG, DOC files (Max 10MB each)</p>
                          </div>
                        </label>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Uploaded Files:</h4>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                  <div>
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={() => setCurrentStep(2)} variant="outline" size="lg">
                        ← Back
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep(4)} variant="gradient" size="lg" glow>
                        Continue to Payment →
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="glass" className="p-8 border-white/20 bg-white/95 backdrop-blur-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
                    </div>

                    <PaymentInvoice
                      paymentDetails={{
                        consultationFee: doctor.consultationFee,
                        platformFee: 50,
                        taxes: Math.round(doctor.consultationFee * 0.18),
                        total: doctor.consultationFee + 50 + Math.round(doctor.consultationFee * 0.18),
                      }}
                      doctorName={doctor.name}
                      appointmentDate={watch("date")}
                      appointmentTime={watch("timeSlot")}
                      onDownload={() => toast.success("Invoice downloaded!")}
                    />

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={() => setCurrentStep(3)} variant="outline" size="lg">
                        ← Back
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        glow
                        icon={<CheckCircle className="w-5 h-5" />}
                      >
                        Confirm & Pay ₹{doctor.consultationFee + 50 + Math.round(doctor.consultationFee * 0.18)}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  )
}
