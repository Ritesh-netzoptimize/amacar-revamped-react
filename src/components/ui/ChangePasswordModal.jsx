import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, X, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { changePassword } from "@/redux/slices/userSlice";

export default function ChangePasswordModal({   
  isOpen,
  onClose,
  onPasswordChange,
  title = "Change Password",
  description = "Enter your current password and choose a new one",
}) {
  // UI state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [phase, setPhase] = useState("form"); // form | loading | success | error
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCloseDisabled = phase === "loading";

  const dispatch = useDispatch();

  // Handle dialog open/close
  const handleOpenChange = (open) => {
    if (!open && !isCloseDisabled) {
      // Reset state when dialog is closed
      resetForm();
      onClose(false);
    }
  };

  const resetForm = () => {
    setPhase("form");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsSubmitting(false);
  };

  function validatePasswords() {
    const newErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };
    
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    } else if (!/(?=.*\d)/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one number";
      }
      
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }
    
    setErrors(newErrors);
    return !newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setIsSubmitting(true);
    setPhase("loading");

    try {
      // Call the parent component's password change handler
      const resultAction = await dispatch(changePassword({ currentPassword, newPassword, confirmPassword }));
      if (changePassword.fulfilled.match(resultAction)) {
        setPhase("success");
      } else {
        setPhase("error");
      }
    } catch (error) {
      setPhase("error");
      // You might want to set specific error messages based on the error type
      if (error.message === "Invalid current password") {
        setErrors(prev => ({ ...prev, currentPassword: "Current password is incorrect" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    resetForm();
    onClose(false);
  };

  const handleTryAgain = () => {
    setPhase("form");
    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCloseDisabled ? undefined : handleOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-2xl shadow-xl p-0 overflow-hidden bg-white"
        showCloseButton={!isCloseDisabled}
      >
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-slate-600">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <AnimatePresence mode="wait">
            {phase === "form" && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-5"
              >
                {/* Current Password */}
                <div className="grid gap-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-slate-800">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-600">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div className="grid gap-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-800">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Changing Password..." : "Change Password"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Lock className="h-4 w-4 text-slate-700" />
                  Your password will be securely encrypted and updated.
                </div>
              </motion.form>
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-6 place-items-center text-center py-8"
              >
                <div className="relative">
                  <div className="grid place-items-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
                    <Lock className="h-12 w-12 text-slate-700 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Changing Your Password</h3>
                  <p className="text-sm text-slate-600">Please wait while we securely update your password...</p>
                </div>
              </motion.div>
            )}

            {phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid gap-5 place-items-center text-center"
              >
                <motion.div 
                  className="relative" 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ type: "spring", stiffness: 340, damping: 18 }}
                >
                  <div className="grid place-items-center rounded-2xl border border-green-200 bg-gradient-to-b from-white to-emerald-50 p-4 shadow-sm">
                    <CheckCircle2 className="h-14 w-14 text-green-500" />
                  </div>
                  <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-amber-500" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Password Changed Successfully!</h3>
                  <p className="text-sm text-slate-600">Your password has been updated securely.</p>
                </div>
                <button
                  onClick={handleSuccessClose}
                  className="cursor-pointer w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}

            {phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid gap-5 place-items-center text-center"
              >
                <motion.div 
                  className="relative" 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ type: "spring", stiffness: 340, damping: 18 }}
                >
                  <div className="grid place-items-center rounded-2xl border border-red-200 bg-gradient-to-b from-white to-red-50 p-4 shadow-sm">
                    <X className="h-14 w-14 text-red-500" />
                  </div>
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Password Change Failed</h3>
                  <p className="text-sm text-slate-600">Something went wrong. Please check your current password and try again.</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleTryAgain}
                    className="cursor-pointer flex-1 h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => handleOpenChange(false)}
                    className="cursor-pointer flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}