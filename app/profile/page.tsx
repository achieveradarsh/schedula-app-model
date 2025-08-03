"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Camera,
  Shield,
  Heart,
  Clock,
  Award,
  Settings,
  LogOut,
  ArrowLeft,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "Mumbai, India",
    dateOfBirth: "1990-01-01",
    bloodGroup: "O+",
    emergencyContact: "+91 9876543210",
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
                onClick={() => router.back()}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700"
              >
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Profile 👤
                </h1>
                <p className="text-slate-600 text-lg mt-1">Manage your account information</p>
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
                    <span className="text-3xl font-bold text-white">{user.name?.charAt(0) || "U"}</span>
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
                        Verified {user.role === "doctor" ? "Doctor" : "Patient"}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-4">{user.email}</p>
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {user.role === "doctor" ? "Healthcare Provider" : "Health Conscious"}
                    </span>
                  </div>
                </div>

                {user.role === "patient" && (
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/20 rounded-xl border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">12</p>
                        <p className="text-xs text-slate-600">Appointments</p>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-xl border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">8</p>
                        <p className="text-xs text-slate-600">Doctors</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                  <User className="w-6 h-6 mr-3 text-indigo-600" />
                  Personal Information
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

                {user.role === "patient" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Date of Birth</label>
                      {editing ? (
                        <Input
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          variant="glass"
                          icon={<Calendar className="w-4 h-4" />}
                          type="date"
                        />
                      ) : (
                        <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                          <p className="text-slate-700">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Blood Group</label>
                      {editing ? (
                        <select
                          value={profileData.bloodGroup}
                          onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                          className="w-full p-3 bg-white/80 backdrop-blur-xl border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                          <p className="text-slate-700">{profileData.bloodGroup}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Emergency Contact */}
          {user.role === "patient" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card variant="glass" className="p-8 border-white/20 bg-white/95">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-3 text-red-600" />
                  Emergency Contact
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Emergency Contact Number</label>
                  {editing ? (
                    <Input
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                      variant="glass"
                      icon={<Phone className="w-4 h-4" />}
                      type="tel"
                    />
                  ) : (
                    <div className="p-3 bg-white/20 rounded-xl border border-slate-200">
                      <p className="text-slate-700">{profileData.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card variant="glass" className="p-8 border-white/20 bg-white/95">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-purple-600" />
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
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Achievements</h4>
                      <p className="text-sm text-slate-600">View your health milestones</p>
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
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Activity History</h4>
                      <p className="text-sm text-slate-600">View your account activity</p>
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
            onClick={() => router.push("/doctors")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Find Doctor</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-pink-600"
            onClick={() => router.push("/appointments")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 transition-all duration-200">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs">Appointments</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-emerald-600"
            onClick={() => router.push("/records")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all duration-200">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs">Records</span>
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
