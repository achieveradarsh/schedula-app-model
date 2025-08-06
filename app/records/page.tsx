"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  TestTube,
  ArrowLeft,
  Search,
  Filter,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAuthStore } from "@/store/authStore"
import { prescriptionService } from "@/services/api"
import toast from "react-hot-toast"

interface MedicalRecord {
  id: string
  type: "prescription" | "lab-report" | "consultation" | "vaccination" | "imaging"
  title: string
  doctorName: string
  date: string
  description: string
  fileUrl?: string
  status: "completed" | "pending" | "scheduled"
}

const mockRecords: MedicalRecord[] = [
  {
    id: "1",
    type: "consultation",
    title: "Eye Consultation Report",
    doctorName: "Dr. Adarsh Babu",
    date: "2024-01-15",
    description: "Regular eye checkup with vision screening and retinal examination",
    status: "completed",
  },
  {
    id: "2",
    type: "prescription",
    title: "Eye Drops Prescription",
    doctorName: "Dr. Adarsh Babu",
    date: "2024-01-15",
    description: "Prescribed eye drops for dry eyes and vision improvement",
    status: "completed",
  },
  {
    id: "3",
    type: "lab-report",
    title: "Blood Test Results",
    doctorName: "Dr. Priya Sharma",
    date: "2024-01-10",
    description: "Complete blood count and lipid profile analysis",
    status: "completed",
  },
  {
    id: "4",
    type: "vaccination",
    title: "COVID-19 Booster",
    doctorName: "Dr. Anita Singh",
    date: "2024-01-05",
    description: "COVID-19 booster vaccination administered",
    status: "completed",
  },
  {
    id: "5",
    type: "imaging",
    title: "Chest X-Ray",
    doctorName: "Dr. Mohammed Ali",
    date: "2023-12-20",
    description: "Chest X-ray for routine health checkup",
    status: "completed",
  },
]

export default function RecordsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")

  const recordTypes = [
    { key: "", label: "All Records", icon: "📋", color: "from-slate-500 to-slate-600" },
    { key: "consultation", label: "Consultations", icon: "👨‍⚕️", color: "from-blue-500 to-cyan-500" },
    { key: "prescription", label: "Prescriptions", icon: "💊", color: "from-green-500 to-emerald-500" },
    { key: "lab-report", label: "Lab Reports", icon: "🧪", color: "from-purple-500 to-indigo-500" },
    { key: "vaccination", label: "Vaccinations", icon: "💉", color: "from-red-500 to-pink-500" },
    { key: "imaging", label: "Imaging", icon: "📸", color: "from-orange-500 to-yellow-500" },
  ]

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch mock records (consultations, lab reports, vaccinations, imaging)
        const mockMedicalRecords = mockRecords.filter(record => record.type !== "prescription")
        
        // Fetch real prescriptions if user is logged in
        let prescriptionRecords: MedicalRecord[] = []
        if (user?.id) {
          try {
            const prescriptions = await prescriptionService.getAllPatientPrescriptions(user.id)
            prescriptionRecords = prescriptions.map((prescription: any) => ({
              id: prescription.id,
              type: "prescription" as const,
              title: `Prescription - ${prescription.diagnosis || 'Medical Prescription'}`,
              doctorName: `Dr. ${prescription.doctorName || 'Doctor'}`, // You might need to add doctorName to prescription data
              date: prescription.createdAt ? new Date(prescription.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              description: `${prescription.medicines?.length || 0} medicine(s) prescribed${prescription.diagnosis ? ' for ' + prescription.diagnosis : ''}`,
              status: prescription.status || "completed" as const,
            }))
          } catch (error) {
            console.error("Failed to fetch prescriptions:", error)
            // Include mock prescription if real fetch fails
            prescriptionRecords = mockRecords.filter(record => record.type === "prescription")
          }
        } else {
          // Include mock prescription for demo purposes when not logged in
          prescriptionRecords = mockRecords.filter(record => record.type === "prescription")
        }
        
        // Combine all records
        const allRecords = [...mockMedicalRecords, ...prescriptionRecords]
        setRecords(allRecords)
      } catch (error) {
        console.error("Failed to fetch records:", error)
        // Fallback to mock data
        setRecords(mockRecords)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [user])

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || record.type === selectedType

    return matchesSearch && matchesType
  })

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="w-5 h-5" />
      case "prescription":
        return <Pill className="w-5 h-5" />
      case "lab-report":
        return <TestTube className="w-5 h-5" />
      case "vaccination":
        return <Heart className="w-5 h-5" />
      case "imaging":
        return <Activity className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "from-blue-500 to-cyan-500"
      case "prescription":
        return "from-green-500 to-emerald-500"
      case "lab-report":
        return "from-purple-500 to-indigo-500"
      case "vaccination":
        return "from-red-500 to-pink-500"
      case "imaging":
        return "from-orange-500 to-yellow-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your medical records..." variant="gradient" />
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
                  Medical Records 📋
                </h1>
                <p className="text-slate-600 text-lg mt-1">Your complete health history</p>
              </div>
            </div>
            <Button variant="gradient" size="lg" glow icon={<Plus className="w-4 h-4" />}>
              Add Record ⚡
            </Button>
          </div>

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
                placeholder="Search records by title, doctor, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-slate-900 placeholder-slate-400"
              />
              <motion.button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-slate-400 hover:text-indigo-600 bg-white/80 rounded-xl hover:bg-white transition-all duration-200"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Record Type Filter */}
          <motion.div
            className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {recordTypes.map((type, index) => (
              <motion.button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedType === type.key
                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200 hover:shadow-md"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{type.icon}</span>
                <span>{type.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Records List */}
      <div className="px-6 py-8">
        <AnimatePresence>
          {filteredRecords.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-slate-100/10 to-slate-200/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No records found</h3>
              <p className="text-slate-700 mb-6">
                {searchQuery || selectedType
                  ? "Try adjusting your search criteria"
                  : "Your medical records will appear here"}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("")
                }}
                variant="gradient"
                glow
              >
                Clear Filters ✨
              </Button>
            </motion.div>
          ) : (
            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover variant="glass" glow className="p-8 border-white/20 bg-white/95">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-6 flex-1">
                        <motion.div
                          className={`w-16 h-16 bg-gradient-to-r ${getRecordColor(
                            record.type,
                          )} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-white">{getRecordIcon(record.type)}</div>
                        </motion.div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-1">{record.title}</h3>
                              <p className="text-indigo-600 font-semibold">Dr. {record.doctorName}</p>
                              <p className="text-slate-700 text-sm mt-2">{record.description}</p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  record.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : record.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                }`}
                              >
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-indigo-600" />
                              <span className="text-slate-700 text-sm">
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-emerald-600" />
                              <span className="text-slate-700 text-sm capitalize">{record.type.replace("-", " ")}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              icon={<Eye className="w-4 h-4 bg-transparent" />}
                              onClick={() => {
                                if (record.type === "prescription") {
                                  router.push(`/records/prescription/${record.id}`)
                                } else {
                                  toast("View details coming soon for this record type")
                                }
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => {
                                if (record.type === "prescription") {
                                  toast.success("Prescription downloaded!")
                                } else {
                                  toast.success("Record downloaded!")
                                }
                              }}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
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
            className="flex flex-col items-center py-2 text-emerald-600"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold">Records</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center py-2 text-slate-400 hover:text-blue-600"
            onClick={() => router.push("/profile")}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mb-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all duration-200">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
