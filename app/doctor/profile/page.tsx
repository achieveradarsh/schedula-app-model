"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Camera,
  Shield,
  Award,
  Clock,
  Users,
  Star,
  Calendar,
  Stethoscope,
  GraduationCap,
  Hospital,
  Languages,
  ArrowLeft,
  LogOut,
  Settings,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export default function DoctorProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experience: "8+ years",
    location: "Mumbai, India",
    hospitalAffiliation: "Apollo Hospitals",
    consultationFee: "1200",
    languages: "English, Hindi, Marathi",
    about: "Experienced cardiologist with expertise in preventive cardiology and interventional procedures.",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Profile updated successfully!")
      setEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading profile..." variant="gradient" />
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
                  Doctor Profile 👨‍⚕️
                </h1>
                <p className="text-slate-600 text-lg mt-1">Manage your professional information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setEditing(!editing)}
                icon={<Edit3 className="w-4 h-4" />}
                disabled={loading}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button variant="danger" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-bold text-white">{user.name?.charAt(0) || "D"}</span>
                  </div>
                  <motion.button
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                    <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30">
                      <span className="text-emerald-600 text-sm font-semibold flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Doctor
                      </span>
                    </div>
                  </div>
                  <p className="text-indigo-600 font-semibold text-lg mb-2">{profileData.specialization}</p>
                  <p className="text-slate-700 mb-4">{profileData.qualification}</p>
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {profileData.experience}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      4.8 Rating
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      3,500+ Patients
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-lg font-bold text-slate-900">156</p>
                      <p className="text-xs text-slate-600">This Month</p>
                    </div>
                    <div className="text-center p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-lg font-bold text-slate-900">4.8</p>
                      <p className="text-xs text-slate-600">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Professional Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Stethoscope className="w-6 h-6 mr-3 text-indigo-600" />
                  Professional Information
                </h3>
                {editing && (
                  <Button onClick={handleSave} loading={loading} variant="gradient" glow>
                    Save Changes ✨
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                  {editing ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      variant="glass"
                      icon={<User className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Specialization</label>
                  {editing ? (
                    <Input
                      value={profileData.specialization}
                      onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      variant="glass"
                      icon={<Stethoscope className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.specialization}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Qualification</label>
                  {editing ? (
                    <Input
                      value={profileData.qualification}
                      onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                      variant="glass"
                      icon={<GraduationCap className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.qualification}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Experience</label>
                  {editing ? (
                    <Input
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      variant="glass"
                      icon={<Clock className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.experience}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Hospital Affiliation</label>
                  {editing ? (
                    <Input
                      value={profileData.hospitalAffiliation}
                      onChange={(e) => setProfileData({ ...profileData, hospitalAffiliation: e.target.value })}
                      variant="glass"
                      icon={<Hospital className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.hospitalAffiliation}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Consultation Fee (₹)</label>
                  {editing ? (
                    <Input
                      value={profileData.consultationFee}
                      onChange={(e) => setProfileData({ ...profileData, consultationFee: e.target.value })}
                      variant="glass"
                      icon={<span className="text-emerald-400">₹</span>}
                      type="number"
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">₹{profileData.consultationFee}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Phone className="w-6 h-6 mr-3 text-emerald-600" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                  {editing ? (
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      variant="glass"
                      icon={<Mail className="w-4 h-4" />}
                      type="email"
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
                  {editing ? (
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      variant="glass"
                      icon={<Phone className="w-4 h-4" />}
                      type="tel"
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.phone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
                  {editing ? (
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      variant="glass"
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.location}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Languages</label>
                  {editing ? (
                    <Input
                      value={profileData.languages}
                      onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                      variant="glass"
                      icon={<Languages className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.languages}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* About Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-purple-600" />
                About
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Professional Summary</label>
                {editing ? (
                  <textarea
                    value={profileData.about}
                    onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                    className="w-full p-3 bg-white/80 backdrop-blur-xl border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 resize-none"
                    rows={4}
                    placeholder="Tell patients about your expertise and approach..."
                  />
                ) : (
                  <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                    <p className="text-slate-700">{profileData.about}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-orange-600" />
                Account Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button
                  className="p-6 bg-white/20 rounded-2xl border border-slate-200 hover:bg-white/30 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Privacy Settings</h4>
                      <p className="text-sm text-slate-600">Manage your privacy preferences</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="p-6 bg-white/20 rounded-2xl border border-slate-200 hover:bg-white/30 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Notifications</h4>
                      <p className="text-sm text-slate-600">Configure notification preferences</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="p-6 bg-white/20 rounded-2xl border border-slate-200 hover:bg-white/30 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Availability</h4>
                      <p className="text-sm text-slate-600">Set your working hours</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="p-6 bg-white/20 rounded-2xl border border-slate-200 hover:bg-white/30 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Achievements</h4>
                      <p className="text-sm text-slate-600">View your professional milestones</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </Card>
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
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs">Dashboard</span>
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
            className="flex flex-col items-center py-2 text-blue-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-1">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
