"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Mail, Phone, Lock, User, Stethoscope, Heart, Sparkles, Eye, EyeOff, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { authService } from "@/services/api"
import { useAuthStore } from "@/store/authStore"
import type { SignupForm } from "@/types"
import toast from "react-hot-toast"

export default function SignupPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<"patient" | "doctor">("patient")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>()

  const watchedPassword = watch("password")

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      const result = await authService.signup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userType,
      })

      if (result.success) {
        login(result.user)
        toast.success(`Welcome to Schedula, ${result.user.name}!`)

        if (userType === "doctor") {
          router.push("/doctor/dashboard")
        } else {
          router.push("/doctors")
        }
      }
    } catch (error) {
      console.error("Signup failed:", error)
      toast.error("Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
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
      </div>

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
                Join Schedula
              </motion.h1>
              <motion.p
                className="text-slate-300 text-2xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Start your healthcare journey ✨
              </motion.p>
              <motion.div
                className="space-y-4 text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Quick and easy registration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Access to top healthcare professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Secure and private platform</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Signup Form */}
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
                      <UserCheck className="w-4 h-4 mr-2" />I want to register as
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

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      icon={<User className="w-5 h-5" />}
                      variant="default"
                      {...register("name", {
                        required: "Full name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      })}
                      error={errors.name?.message}
                    />

                    <Input
                      label="Email Address"
                      placeholder="Enter your email"
                      type="email"
                      icon={<Mail className="w-5 h-5" />}
                      variant="default"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      error={errors.email?.message}
                    />

                    <Input
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      type="tel"
                      icon={<Phone className="w-5 h-5" />}
                      variant="default"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit phone number",
                        },
                      })}
                      error={errors.phone?.message}
                    />

                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        icon={<Lock className="w-5 h-5" />}
                        variant="default"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        error={errors.password?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        icon={<Lock className="w-5 h-5" />}
                        variant="default"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) => value === watchedPassword || "Passwords do not match",
                        })}
                        error={errors.confirmPassword?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        {...register("acceptTerms", {
                          required: "Please accept the terms and conditions",
                        })}
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
                        I agree to the{" "}
                        <button type="button" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-600 font-medium">{errors.acceptTerms.message}</p>
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
                      Create Account ✨
                    </Button>
                  </form>

                  <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-slate-600">
                      Already have an account?{" "}
                      <button
                        onClick={() => router.push("/")}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Sign In ✨
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
              Join Schedula
            </motion.h1>
            <motion.p
              className="text-slate-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Start your healthcare journey ✨
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
                <UserCheck className="w-4 h-4 mr-2" />I want to register as
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                icon={<User className="w-5 h-5" />}
                variant="default"
                {...register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                icon={<Mail className="w-5 h-5" />}
                variant="default"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                type="tel"
                icon={<Phone className="w-5 h-5" />}
                variant="default"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                })}
                error={errors.phone?.message}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  icon={<Lock className="w-5 h-5" />}
                  variant="default"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  icon={<Lock className="w-5 h-5" />}
                  variant="default"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === watchedPassword || "Passwords do not match",
                  })}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-12 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  {...register("acceptTerms", {
                    required: "Please accept the terms and conditions",
                  })}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
                  I agree to the{" "}
                  <button type="button" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600 font-medium">{errors.acceptTerms.message}</p>}

              <Button type="submit" fullWidth loading={loading} size="lg" variant="gradient" glow className="mt-8">
                Create Account ✨
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/")}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Sign In ✨
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
