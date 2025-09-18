import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X, Home, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  errorMessage = "An error occurred. Please try again.",
  suggestion = null,
  redirectDelay = 5000,
  redirectPath = "/"
}) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000))
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Reset countdown when modal opens
    setCountdown(Math.ceil(redirectDelay / 1000))
    setIsRedirecting(false)

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setIsRedirecting(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Auto redirect after delay
    const redirectTimeout = setTimeout(() => {
      onClose()
      navigate(redirectPath)
    }, redirectDelay)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimeout)
    }
  }, [isOpen, redirectDelay, redirectPath, navigate, onClose])

  const handleManualRedirect = () => {
    setIsRedirecting(true)
    onClose()
    navigate(redirectPath)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl p-0 overflow-hidden bg-white" showCloseButton={false}>
        <div className="bg-gradient-to-br from-white via-red-50 to-red-100 p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Error Occurred
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              {suggestion || "Something went wrong while processing your request"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Error Icon and Message */}
            <div className="text-center space-y-4">
              <motion.div 
                className="relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 340, damping: 18 }}
              >
                <div className="grid place-items-center rounded-2xl border border-red-200 bg-gradient-to-b from-white to-red-50 p-4 shadow-sm mx-auto w-fit">
                  <AlertCircle className="h-14 w-14 text-red-500" />
                </div>
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {errorMessage}
                </h3>
                <p className="text-sm text-slate-600">
                  You will be redirected to the home page in {countdown} seconds
                </p>
              </div>
            </div>

            {/* Redirect Button */}
            <div className="space-y-3">
              <button
                onClick={handleManualRedirect}
                disabled={isRedirecting}
                className={`w-full h-11 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                  isRedirecting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:scale-[1.02]'
                }`}
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Redirecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Home className="h-4 w-4" />
                    Go to Home Page
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
