"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export default function DoctorProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading profile..." variant="gradient" />
    </div>
  )
}
