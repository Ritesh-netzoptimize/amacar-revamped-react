import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '@/redux/slices/userSlice';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({
  isOpen,
  onClose,
}) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | loading | success | failed
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setPhase('form');
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Current Password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    } else if (formData.currentPassword.trim().length < 6) {
      newErrors.currentPassword = 'Current password must be at least 6 characters';
    }

    // New Password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.trim().length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setPhase('loading');
    
    try {
      // Call the changePassword API
      const resultAction = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }));
      
      if (changePassword.fulfilled.match(resultAction)) {
        setPhase('success');
        toast.success('Password changed successfully!', { duration: 2000 });
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPhase('failed');
        toast.error(resultAction.payload || 'Failed to change password. Please try again.', { duration: 2000 });
      }
      
    } catch (error) {
      setPhase('failed');
      toast.error('Failed to change password. Please try again.', { duration: 2000 });
    }
  };

  const handleModalClose = (open) => {
    if (!open && phase !== 'loading') {
      onClose();
    }
  };

  const handleBackToForm = () => {
    setPhase('form');
    setErrors({});
  };

  const isCloseDisabled = phase === 'loading' || status === 'loading';

  return (
    <Dialog open={isOpen} onOpenChange={isCloseDisabled ? undefined : handleModalClose}>
      <DialogContent
        className="sm:max-w-lg rounded-2xl shadow-xl p-0 overflow-hidden bg-white"
        showCloseButton={!isCloseDisabled}
      >
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Update your password to keep your account secure
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <AnimatePresence mode="wait">
            {phase === 'form' && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-5"
              >
                {/* Current Password Field */}
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
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter your current password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.currentPassword}
                    </motion.p>
                  )}
                </div>

                {/* New Password Field */}
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
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter your new password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.newPassword}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
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
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your new password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                  Your password is encrypted and secure
                </div>
              </motion.form>
            )}

            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-6 place-items-center text-center"
              >
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full">
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                    <span className="text-sm text-slate-700">Changing your password...</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200">
                    <motion.div
                      className="h-1 bg-slate-800"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ ease: "easeOut", duration: 1.5 }}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Please wait while we update your password...
                </div>
              </motion.div>
            )}

            {phase === 'success' && (
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
                  <h3 className="text-lg font-semibold text-slate-900">Password Changed!</h3>
                  <p className="text-sm text-slate-600">Your password has been successfully updated.</p>
                </div>
              </motion.div>
            )}

            {phase === 'failed' && (
              <motion.div
                key="failed"
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
                    <XCircle className="h-14 w-14 text-red-500" />
                  </div>
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Password Change Failed</h3>
                  <p className="text-sm text-slate-600">Please try again.</p>
                </div>
                <button
                  onClick={handleBackToForm}
                  className="cursor-pointer w-full max-w-[200px] h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}