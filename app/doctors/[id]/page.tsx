"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Star, MapPin, Clock, Users, Award, Calendar, Phone, Shield, Stethoscope } from "lucide-react"
import { doctorService } from "@/services/api"
import type { Doctor } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export default function DoctorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorData = await doctorService.getDoctorById(params.id as string)
        setDoctor(doctorData)
      } catch (error) {
        console.error("Failed to fetch doctor:", error)
        setError("Failed to load doctor details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDoctor()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading doctor details..." variant="gradient" />
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center border-white/20 bg-white/90">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || "Doctor not found"}</h2>
          <Button onClick={() => router.back()} variant="gradient">
            Go Back
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
                Doctor Profile
              </h1>
              <p className="text-slate-600">Complete doctor information</p>
            </div>
          </div>

          {/* Doctor Info Card */}
          <Card variant="gradient" className="p-6 mb-6 bg-white shadow-xl">
            <div className="flex items-center space-x-6">
              <motion.div
                className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl font-bold text-indigo-600">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                {doctor.verified && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Shield className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-2">
                  {doctor.name}
                  {doctor.verified && <Award className="w-5 h-5 text-emerald-500 ml-2" />}
                </h2>
                <p className="text-indigo-600 font-semibold text-lg">{doctor.specialization}</p>
                <p className="text-sm text-slate-600 mt-1">{doctor.qualification}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {doctor.location}
                  </span>
                  <span className="flex items-center">
                    <Stethoscope className="w-4 h-4 mr-1" />
                    {doctor.experience} experience
                  </span>
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {doctor.phone}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">₹{doctor.consultationFee}</p>
                <p className="text-sm text-slate-500">Consultation Fee</p>
                <div className="flex items-center justify-end mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold text-slate-700">
                    {doctor.rating} ({doctor.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6 text-center border-white/20 bg-white/90">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{doctor.patients}</p>
              <p className="text-sm text-slate-600">Patients Treated</p>
            </Card>

            <Card variant="glass" className="p-6 text-center border-white/20 bg-white/90">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{doctor.experience}</p>
              <p className="text-sm text-slate-600">Years Experience</p>
            </Card>

            <Card variant="glass" className="p-6 text-center border-white/20 bg-white/90">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{doctor.rating}</p>
              <p className="text-sm text-slate-600">Average Rating</p>
            </Card>

            <Card variant="glass" className="p-6 text-center border-white/20 bg-white/90">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{doctor.reviews}</p>
              <p className="text-sm text-slate-600">Patient Reviews</p>
            </Card>
          </motion.div>

          {/* About Doctor */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/90">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <Stethoscope className="w-6 h-6 mr-3 text-indigo-400" />
                About Dr. {doctor.name.split(" ")[1] || doctor.name}
              </h3>
              <p className="text-slate-700 leading-relaxed">{doctor.about}</p>
            </Card>
          </motion.div>

          {/* Services & Specialization */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card variant="glass" className="p-8 border-white/20 bg-white/90">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Services Offered</h3>
                <div className="space-y-3">
                  {doctor.services.map((service, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <span className="text-slate-700">{service}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <Card variant="glass" className="p-8 border-white/20 bg-white/90">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Professional Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Specialization</p>
                    <p className="text-slate-900">{doctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Qualification</p>
                    <p className="text-slate-900">{doctor.qualification}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Hospital Affiliation</p>
                    <p className="text-slate-900">{doctor.hospitalAffiliation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctor.languages.map((language, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Availability */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/90">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{doctor.availability.days}</p>
                      <p className="text-emerald-600 font-medium">{doctor.availability.hours}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Next Available</p>
                      <p className="text-blue-600 font-medium">Today, 2:30 PM</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Awards & Recognition */}
          {doctor.awards && doctor.awards.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card variant="glass" className="p-8 border-white/20 bg-white/90">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-yellow-400" />
                  Awards & Recognition
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.awards.map((award, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-900 font-medium">{award}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Book Appointment Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="xl"
              variant="gradient"
              glow
              onClick={() => router.push(`/doctors/${doctor.id}/book`)}
              className="px-12 py-4 text-lg"
            >
              Book Appointment Now ⚡
            </Button>
            <p className="text-slate-300 text-sm mt-4">Available for both online and in-person consultations</p>
          </motion.div>
        </div>
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
            onClick={() => router.push("/doctors")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs">Find Doctor</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-indigo-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-1">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Doctor Profile</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-emerald-600"
            onClick={() => router.push("/appointments")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all duration-200">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs">Appointments</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-blue-600"
            onClick={() => router.push("/profile")}
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
