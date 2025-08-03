"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Star, MapPin, Clock, Users, Stethoscope, Calendar, User } from "lucide-react"
import { doctorService } from "@/services/api"
import type { Doctor } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import toast from "react-hot-toast"

export default function DoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  const specialties = [
    "All Specialties",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Ophthalmologist",
    "Orthopedic",
    "Pediatrician",
    "Psychiatrist",
  ]

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await doctorService.getAllDoctors()
        setDoctors(doctorsData)
        setFilteredDoctors(doctorsData)
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
        toast.error("Failed to load doctors")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    let filtered = doctors

    if (searchQuery) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter((doctor) => doctor.specialization === selectedSpecialty)
    }

    setFilteredDoctors(filtered)
  }, [searchQuery, selectedSpecialty, doctors])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Finding the best doctors for you..." variant="gradient" />
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
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Find Your Doctor 👨‍⚕️
            </h1>
            <p className="text-slate-600 text-lg">Book appointments with top-rated healthcare professionals</p>
          </motion.div>

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
                placeholder="Search doctors by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400 shadow-lg"
              />
            </div>
          </motion.div>

          {/* Specialty Filter */}
          <motion.div
            className="flex space-x-2 overflow-x-auto pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {specialties.map((specialty, index) => (
              <motion.button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  selectedSpecialty === specialty || (selectedSpecialty === "" && specialty === "All Specialties")
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-md"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {specialty}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Doctors Grid */}
      <div className="px-6 py-8">
        <AnimatePresence>
          {filteredDoctors.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-slate-100/10 to-slate-200/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No doctors found</h3>
              <p className="text-slate-300 mb-6">Try adjusting your search criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedSpecialty("")
                }}
                variant="gradient"
                glow
              >
                Clear Filters ✨
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    hover
                    variant="glass"
                    glow
                    className="p-6 cursor-pointer border-white/20 bg-white/95 backdrop-blur-xl shadow-xl"
                    onClick={() => router.push(`/doctors/${doctor.id}`)}
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
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
                            <span className="text-white text-xs">✓</span>
                          </motion.div>
                        )}
                      </motion.div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2">{doctor.name}</h3>
                      <p className="text-indigo-600 font-semibold text-lg mb-1">{doctor.specialization}</p>
                      <p className="text-sm text-slate-600 mb-3">{doctor.qualification}</p>

                      <div className="flex items-center justify-center space-x-1 mb-4">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-slate-700">
                          {doctor.rating} ({doctor.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{doctor.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{doctor.experience} experience</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{doctor.patients} patients treated</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee}</p>
                        <p className="text-xs text-slate-500">Consultation Fee</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">Available</p>
                        <p className="text-xs text-emerald-600">{doctor.availability.hours}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        fullWidth
                        variant="gradient"
                        glow
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/doctors/${doctor.id}/book`)
                        }}
                      >
                        Book Appointment ⚡
                      </Button>
                      <Button
                        fullWidth
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/doctors/${doctor.id}`)
                        }}
                      >
                        View Profile
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
            className="flex flex-col items-center py-2 text-indigo-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-1">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Find Doctor</span>
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
            onClick={() => router.push("/records")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all duration-200">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-xs">Records</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-purple-600"
            onClick={() => router.push("/profile")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
