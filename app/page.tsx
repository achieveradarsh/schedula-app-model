"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, Lock, User, Stethoscope, Heart, Sparkles, Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { authService } from "@/services/api"
import { useAuthStore } from "@/store/authStore"
import type { LoginForm } from "@/types"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<"patient" | "doctor">("patient")
  const [loginType, setLoginType] = useState<"email" | "mobile">("email")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register: registerDesktop,
    handleSubmit: handleSubmitDesktop,
    formState: { errors: errorsDesktop },
    watch: watchDesktop,
    reset: resetDesktop,
  } = useForm<LoginForm>()

  const {
    register: registerMobile,
    handleSubmit: handleSubmitMobile,
    formState: { errors: errorsMobile },
    watch: watchMobile,
    reset: resetMobile,
  } = useForm<LoginForm>()

  const watchedEmailDesktop = watchDesktop("emailOrMobile")
  const watchedEmailMobile = watchMobile("emailOrMobile")

  // Reset forms when switching login types
  useEffect(() => {
    resetDesktop()
    resetMobile()
  }, [loginType, resetDesktop, resetMobile])

  // Reset forms when switching user types
  useEffect(() => {
    resetDesktop()
    resetMobile()
  }, [userType, resetDesktop, resetMobile])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      if (loginType === "mobile") {
        localStorage.setItem("phoneNumber", data.emailOrMobile)
        localStorage.setItem("userType", userType)
        router.push("/otp")
      } else {
        if (!data.password) {
          toast.error("Password is required")
          return
        }
        
        const result = await authService.login({
          email: data.emailOrMobile,
          password: data.password,
          userType,
        })

        if (result.success) {
          login(result.user)
          toast.success(`Welcome back, ${result.user.name}!`)

          if (userType === "doctor") {
            router.push("/doctor/dashboard")
          } else {
            router.push("/doctors")
          }
        }
      }
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors)
    // Show validation errors to user
    Object.keys(errors).forEach(key => {
      const error = errors[key]
      if (error?.message) {
        toast.error(error.message)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden" suppressHydrationWarning>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      {/* Floating Particles - Client-side only to prevent hydration issues */}
      {mounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 flex-1 px-6 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex min-h-screen items-center">
          <div className="flex w-full max-w-7xl mx-auto">
            {/* Left Side - Branding */}
            <motion.div
              className="flex-1 flex flex-col justify-center pr-16"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="relative w-32 h-32 mb-8"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-60"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-16 h-16 text-white" />
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                className="text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Schedula
              </motion.h1>
              <motion.p
                className="text-slate-300 text-2xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your Health, Our Priority ✨
              </motion.p>
              <motion.div
                className="space-y-4 text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Book appointments with top doctors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Secure online consultations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Manage your health records</span>
                </div>
              </motion.div>

              {/* Test Credentials */}
              <motion.div
                className="mt-12 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Test Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-cyan-400 font-medium">Patient</p>
                    <p className="text-slate-300">📧 patient@example.com</p>
                    <p className="text-slate-300">🔒 password</p>
                    <p className="text-slate-300">📱 1234567890 (OTP: any)</p>
                  </div>
                  <div>
                    <p className="text-purple-400 font-medium">Dr. Adarsh Babu</p>
                    <p className="text-slate-300">📧 doctor@example.com</p>
                    <p className="text-slate-300">🔒 password</p>
                    <p className="text-slate-300">📱 9876543210 (OTP: any)</p>
                  </div>
                  <div>
                    <p className="text-pink-400 font-medium">Dr. Priya Sharma (Recommended)</p>
                    <p className="text-slate-300">📧 priya.sharma@schedula.com</p>
                    <p className="text-slate-300">🔒 password</p>
                    <p className="text-slate-300">📱 9876543215 (OTP: any)</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-full max-w-md">
                <Card variant="glass" className="p-8 backdrop-blur-2xl border-white/20 bg-white/90">
                  {/* User Type Selection */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />I am a
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setUserType("patient")}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                          userType === "patient"
                            ? "border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 shadow-lg shadow-cyan-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <User className="w-8 h-8 mx-auto mb-3" />
                        <span className="text-sm font-semibold">Patient</span>
                        <p className="text-xs text-slate-500 mt-1">Book appointments</p>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setUserType("doctor")}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                          userType === "doctor"
                            ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg shadow-purple-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Stethoscope className="w-8 h-8 mx-auto mb-3" />
                        <span className="text-sm font-semibold">Doctor</span>
                        <p className="text-xs text-slate-500 mt-1">Manage practice</p>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Login Type Selection */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex bg-slate-100 backdrop-blur-sm rounded-2xl p-1">
                      <button
                        type="button"
                        onClick={() => setLoginType("email")}
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          loginType === "email"
                            ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/20"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginType("mobile")}
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          loginType === "mobile"
                            ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/20"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Mobile
                      </button>
                    </div>
                  </motion.div>

                  <form onSubmit={handleSubmitDesktop(onSubmit, onError)} className="space-y-6" noValidate>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loginType}
                        initial={{ opacity: 0, x: loginType === "email" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: loginType === "email" ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Input
                          label={loginType === "email" ? "Email Address" : "Mobile Number"}
                          placeholder={loginType === "email" ? "Enter your email" : "Enter your mobile number"}
                          type={loginType === "email" ? "email" : "tel"}
                          icon={loginType === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                          variant="default"
                          {...registerDesktop("emailOrMobile", {
                            required: `${loginType === "email" ? "Email" : "Mobile number"} is required`,
                            pattern:
                              loginType === "email"
                                ? {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address",
                                  }
                                : {
                                    value: /^[0-9]{10}$/,
                                    message: "Please enter a valid 10-digit mobile number",
                                  },
                          })}
                          error={errorsDesktop.emailOrMobile?.message}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {loginType === "email" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            icon={<Lock className="w-5 h-5" />}
                            variant="default"
                            {...registerDesktop("password", {
                              required: loginType === "email" ? "Password is required" : false,
                              minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                              },
                            })}
                            error={errorsDesktop.password?.message}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {loginType === "email" && (
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span className="ml-2 text-sm text-slate-600">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
                          Forgot Password?
                        </button>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                      size="lg"
                      variant="gradient"
                      glow
                      className="mt-8"
                    >
                      {loginType === "mobile" ? "Send OTP 🚀" : "Sign In ✨"}
                    </Button>
                  </form>

                  <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-slate-600">
                      Don't have an account?{" "}
                      <button
                        onClick={() => router.push("/signup")}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Sign Up ✨
                      </button>
                    </p>
                  </motion.div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto">
          {/* Logo & Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-28 h-28 mx-auto mb-6"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-60"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Heart className="w-14 h-14 text-white" />
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </motion.div>
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Schedula
            </motion.h1>
            <motion.p
              className="text-slate-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your Health, Our Priority ✨
            </motion.p>
          </motion.div>

          <Card variant="glass" className="p-8 backdrop-blur-2xl border-white/20 bg-white/90">
            {/* User Type Selection */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2" />I am a
              </p>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setUserType("patient")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    userType === "patient"
                      ? "border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 shadow-lg shadow-cyan-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-8 h-8 mx-auto mb-3" />
                  <span className="text-sm font-semibold">Patient</span>
                  <p className="text-xs text-slate-500 mt-1">Book appointments</p>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setUserType("doctor")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    userType === "doctor"
                      ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg shadow-purple-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Stethoscope className="w-8 h-8 mx-auto mb-3" />
                  <span className="text-sm font-semibold">Doctor</span>
                  <p className="text-xs text-slate-500 mt-1">Manage practice</p>
                </motion.button>
              </div>
            </motion.div>

            {/* Login Type Selection */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex bg-slate-100 backdrop-blur-sm rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    loginType === "email"
                      ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("mobile")}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    loginType === "mobile"
                      ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Mobile
                </button>
              </div>
            </motion.div>

            <form onSubmit={handleSubmitMobile(onSubmit, onError)} className="space-y-6" noValidate>
              <AnimatePresence mode="wait">
                <motion.div
                  key={loginType}
                  initial={{ opacity: 0, x: loginType === "email" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: loginType === "email" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    label={loginType === "email" ? "Email Address" : "Mobile Number"}
                    placeholder={loginType === "email" ? "Enter your email" : "Enter your mobile number"}
                    type={loginType === "email" ? "email" : "tel"}
                    icon={loginType === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    variant="default"
                    {...registerMobile("emailOrMobile", {
                      required: `${loginType === "email" ? "Email" : "Mobile number"} is required`,
                      pattern:
                        loginType === "email"
                          ? {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email address",
                            }
                          : {
                              value: /^[0-9]{10}$/,
                              message: "Please enter a valid 10-digit mobile number",
                            },
                    })}
                    error={errorsMobile.emailOrMobile?.message}
                  />
                </motion.div>
              </AnimatePresence>

              {loginType === "email" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      icon={<Lock className="w-5 h-5" />}
                      variant="default"
                      {...registerMobile("password", {
                        required: loginType === "email" ? "Password is required" : false,
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      error={errorsMobile.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {loginType === "email" && (
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                loading={loading} 
                size="lg" 
                variant="gradient" 
                glow 
                className="mt-8"
              >
                {loginType === "mobile" ? "Send OTP 🚀" : "Sign In ✨"}
              </Button>
            </form>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-slate-600">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Sign Up ✨
                </button>
              </p>
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  )
}
