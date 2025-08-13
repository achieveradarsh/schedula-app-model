"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Star, 
  Send, 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock,
  Stethoscope,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { appointmentService, reviewService } from '@/services/api'
import type { Appointment } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import moment from 'moment'

interface ReviewForm {
  rating: number
  reviewText: string
}

export default function SubmitReviewPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReviewForm>({
    defaultValues: {
      rating: 0,
      reviewText: ''
    }
  })

  const selectedRating = watch('rating')

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const appointmentData = await appointmentService.getAppointmentById(params.id as string)
        
        // Verify this appointment belongs to the current patient
        if (appointmentData.patientId !== user?.id) {
          toast.error("You can only review your own appointments")
          router.push("/appointments")
          return
        }

        // Check if appointment is completed
        if (appointmentData.status !== 'completed') {
          toast.error("You can only review completed appointments")
          router.push("/appointments")
          return
        }

        setAppointment(appointmentData)
      } catch (error) {
        console.error("Failed to fetch appointment:", error)
        toast.error("Failed to load appointment details")
        router.push("/appointments")
      } finally {
        setLoading(false)
      }
    }

    if (params.id && user) {
      fetchAppointment()
    }
  }, [params.id, user, router])

  const onSubmit = async (data: ReviewForm) => {
    if (!appointment) return

    setSubmitting(true)
    try {
      const result = await reviewService.submitReview({
        appointmentId: appointment.id,
        patientId: user?.id || '',
        doctorId: appointment.doctorId,
        rating: data.rating,
        comment: data.reviewText
      })

      if (result.success) {
        toast.success('Review submitted successfully!')
        router.push('/appointments')
      } else {
        throw new Error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStarClick = (rating: number) => {
    setValue('rating', rating)
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= (hoveredStar || selectedRating)
      
      return (
        <button
          key={starValue}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          className={`p-1 transition-all duration-200 ${
            isFilled 
              ? 'text-yellow-400 transform scale-110' 
              : 'text-slate-300 hover:text-yellow-300'
          }`}
        >
          <Star 
            className={`w-8 h-8 ${isFilled ? 'fill-current' : ''}`} 
          />
        </button>
      )
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading appointment..." variant="gradient" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center border-white/20 bg-white/90">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Appointment Not Found</h2>
          <Button onClick={() => router.push("/appointments")} variant="gradient">
            Back to Appointments
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/appointments")}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700"
              >
                Back to Appointments
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Submit Review
                </h1>
                <p className="text-slate-600">Share your experience with {appointment.doctor?.name || 'Doctor'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Form */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Appointment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 font-medium">{appointment.doctor?.name || 'Doctor'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{moment(appointment.date).format("MMM DD, YYYY")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{appointment.timeSlot}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{appointment.consultationType}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Review Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Star Rating */}
                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-4">
                    How would you rate your experience?
                  </label>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {renderStars()}
                  </div>
                  <div className="text-center">
                    <span className="text-slate-600 text-sm">
                      {selectedRating === 0 && "Please select a rating"}
                      {selectedRating === 1 && "Poor"}
                      {selectedRating === 2 && "Fair"}
                      {selectedRating === 3 && "Good"}
                      {selectedRating === 4 && "Very Good"}
                      {selectedRating === 5 && "Excellent"}
                    </span>
                  </div>
                  {errors.rating && (
                    <p className="text-red-500 text-sm mt-2 text-center">Rating is required</p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-3">
                    Share your experience
                  </label>
                  <textarea
                    {...register('reviewText', { 
                      required: 'Please share your experience',
                      minLength: { value: 10, message: 'Review must be at least 10 characters long' },
                      maxLength: { value: 500, message: 'Review must be less than 500 characters' }
                    })}
                    placeholder="Tell us about your experience with the doctor, treatment quality, waiting time, staff behavior, etc."
                    className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-900 bg-white/80"
                  />
                  {errors.reviewText && (
                    <p className="text-red-500 text-sm mt-2">{errors.reviewText.message}</p>
                  )}
                  <p className="text-slate-500 text-sm mt-2">
                    {watch('reviewText')?.length || 0}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => router.push("/appointments")}
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
                    disabled={submitting || selectedRating === 0}
                    icon={submitting ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="p-6 border-amber-200 bg-amber-50/90">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 mb-2">Review Guidelines</h4>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Be honest and constructive in your feedback</li>
                    <li>• Focus on your personal experience with the healthcare service</li>
                    <li>• You can edit or delete your review within 24 hours</li>
                    <li>• Avoid sharing personal medical information</li>
                    <li>• Keep your review professional and respectful</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
