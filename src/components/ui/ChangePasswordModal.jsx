import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, Sparkles, XCircle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, forgotPassword, verifyOTP, resetPassword, clearError } from '@/redux/slices/userSlice';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({
  isOpen,
  onClose,
}) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | loading | success | failed | forgot | verify-otp | reset-password
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Get user email from localStorage
      const storedUser = localStorage.getItem('authUser');
      const userEmail = storedUser ? JSON.parse(storedUser).email : '';
      
      setFormData({
        email: userEmail || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: '',
      });
      setErrors({});
      setPhase('form');
      setIsForgotPasswordMode(false);
      setResetToken(null);
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation for forgot password
    if (isForgotPasswordMode && phase === 'forgot') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    console.log("isForgotPasswordMode", isForgotPasswordMode);
    
    // Current Password validation (only for change password)
    if (!isForgotPasswordMode && !formData.currentPassword.trim()) {
        console.log("isForgotPasswordMode after current passwrod validation", isForgotPasswordMode);
      newErrors.currentPassword = 'Current password is required';
    } else if (!isForgotPasswordMode && formData.currentPassword.trim().length < 6) {
      newErrors.currentPassword = 'Current password must be at least 6 characters';
    }

    // New Password validation (show for normal change password and reset password phases)
    if ((!isForgotPasswordMode || phase === 'reset-password') && !formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if ((!isForgotPasswordMode || phase === 'reset-password') && formData.newPassword.trim().length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (!isForgotPasswordMode && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm Password validation (show for normal change password and reset password phases)
    if ((!isForgotPasswordMode || phase === 'reset-password') && !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if ((!isForgotPasswordMode || phase === 'reset-password') && formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    console.log("newErrors", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = { ...errors, otp: '' };
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be a 6-digit number';
    }
    setErrors(prev => ({ ...prev, otp: newErrors.otp || '' }));
    return !newErrors.otp;
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
      console.log("isForgotPasswordMode after validateForm but not validated", isForgotPasswordMode);
      return;
    }
    console.log("isForgotPasswordMode after validateForm", isForgotPasswordMode);

    setPhase('loading');
    
    try {
      if (isForgotPasswordMode && phase === 'forgot') {
        // Handle forgot password
        await dispatch(forgotPassword(formData.email)).unwrap();
        setPhase('verify-otp');
      } else if (phase === 'reset-password') {
        // Handle reset password
        await dispatch(resetPassword({
          token: resetToken,
          otp: formData.otp,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })).unwrap();
        setPhase('success');
        toast.success('Password reset successfully!', { duration: 2000 });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Handle change password
        const resultAction = await dispatch(changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }));
        
        if (changePassword.fulfilled.match(resultAction)) {
          setPhase('success');
          toast.success('Password changed successfully!', { duration: 2000 });
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setPhase('failed');
          toast.error(resultAction.payload || 'Failed to change password. Please try again.', { duration: 2000 });
        }
      }
      
    } catch (error) {
      setPhase('failed');
      // Extract error message from Axios response
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage, { duration: 3000 });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setPhase('loading');
    try {
      const token = await dispatch(verifyOTP({ email: formData.email, otp: formData.otp })).unwrap();
      setResetToken(token);
      setPhase('reset-password');
    } catch (error) {
      setPhase('verify-otp');
      // Extract error message from Axios response
      const errorMessage = error?.response?.data?.message || error?.message || 'Wrong OTP. Please try again.';
      setErrors(prev => ({ ...prev, otp: errorMessage }));
      toast.error(errorMessage, { duration: 3000 });
    }
  };

  const handleModalClose = (open) => {
    if (!open && phase !== 'loading' && phase !== 'verify-otp') {
      onClose();
    }
  };

  const handleBackToForm = () => {
    setPhase('form');
    setErrors({});
    setIsForgotPasswordMode(false);
    setResetToken(null);
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordMode(true);
    setPhase('forgot');
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '', otp: '' }));
    setErrors({});
  };

  const handleBackToChangePassword = () => {
    setIsForgotPasswordMode(false);
    setPhase('form');
    setResetToken(null);
    setFormData(prev => ({ ...prev, email: '', otp: '' }));
    setErrors({});
  };

  const isCloseDisabled = phase === 'loading' || phase === 'verify-otp' || status === 'loading';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={isCloseDisabled ? undefined : handleModalClose}>
        <DialogContent
          className="sm:max-w-lg rounded-2xl shadow-xl p-0 overflow-hidden bg-white"
          showCloseButton={!isCloseDisabled}
        >
          <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {isForgotPasswordMode && phase === 'forgot'
                  ? "Forgot Password"
                  : isForgotPasswordMode && phase === 'verify-otp'
                  ? "Verify OTP"
                  : isForgotPasswordMode && phase === 'reset-password'
                  ? "Reset Password"
                  : "Change Password"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                {isForgotPasswordMode && phase === 'forgot'
                  ? "Enter your email to receive a verification OTP"
                  : phase === 'verify-otp'
                  ? `We've sent a 6-digit OTP to ${formData.email}. Please enter it below.`
                  : phase === 'reset-password'
                  ? "Enter your new password"
                  : "Update your password to keep your account secure"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 pt-0">
            <AnimatePresence mode="wait">
              {(phase === 'form' || phase === 'forgot' || phase === 'reset-password') && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid gap-5"
                >
                   {/* Email Field for Forgot Password */}
                   {isForgotPasswordMode && phase === 'forgot' && (
                     <div className="grid gap-2">
                       <label htmlFor="email" className="text-sm font-medium text-slate-800">
                         Email Address
                       </label>
                       <div className="relative">
                         <div className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                           formData.email ? 'text-orange-500' : 'text-slate-400'
                         }`}>
                           <Mail className="h-4 w-4" />
                         </div>
                         <input
                           id="email"
                           type="email"
                           value={formData.email}
                           onChange={(e) => handleInputChange('email', e.target.value)}
                           placeholder="user@example.com"
                           disabled={!!formData.email}
                           className={`h-11 w-full rounded-xl border pl-9 pr-3 text-sm outline-none ring-0 transition-shadow ${
                             formData.email
                               ? 'border-orange-200 bg-orange-50 text-orange-800 cursor-not-allowed'
                               : 'border-slate-200 bg-white focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]'
                           }`}
                         />
                       </div>
                       {errors.email && (
                         <motion.p
                           initial={{ opacity: 0, y: -4 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="text-xs text-red-600"
                         >
                           {errors.email}
                         </motion.p>
                       )}
                     </div>
                   )}

                  {/* Current Password Field (only for change password) */}
                  {!isForgotPasswordMode && (
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
                  )}

                  {/* New Password Field */}
                  {(!isForgotPasswordMode || phase === 'reset-password') && (
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
                  )}

                  {/* Confirm Password Field */}
                  {(!isForgotPasswordMode || phase === 'reset-password') && (
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
                  )}
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
                          {isForgotPasswordMode && phase === 'forgot'
                            ? 'Sending OTP...'
                            : phase === 'reset-password'
                            ? 'Updating Password...'
                            : 'Changing Password...'}
                        </div>
                      ) : (
                        isForgotPasswordMode && phase === 'forgot'
                          ? 'Send OTP'
                          : phase === 'reset-password'
                          ? 'Update Password'
                          : 'Change Password'
                      )}
                    </button>
                  </div>

                  {/* Forgot Password Link (only for change password mode) */}
                  {!isForgotPasswordMode && phase === 'form' && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition-colors underline underline-offset-2"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Back to Change Password Link (for forgot password mode) */}
                  {isForgotPasswordMode && (phase === 'forgot' || phase === 'reset-password') && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleBackToChangePassword}
                        className="cursor-pointer text-sm text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 transition-colors"
                      >
                        Back to Change Password
                      </button>
                    </div>
                  )}

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
                    <h3 className="text-lg font-semibold text-slate-900">
                      {isForgotPasswordMode ? 'Password Reset!' : 'Password Changed!'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isForgotPasswordMode 
                        ? 'Your password has been successfully reset.' 
                        : 'Your password has been successfully updated.'}
                    </p>
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

      {/* OTP Verification Modal (Only for Forgot Password) */}
      {isForgotPasswordMode && phase === "verify-otp" && (
        <Dialog open={phase === "verify-otp"} onOpenChange={(open) => {
          if (!open && status !== "loading") {
            handleBackToChangePassword();
          }
        }}>
          <DialogContent className="sm:max-w-md rounded-2xl shadow-xl p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                Verify OTP
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                We've sent a 6-digit OTP to {formData.email}. Please enter it below.
              </DialogDescription>
            </DialogHeader>
            <motion.form
              onSubmit={handleOtpSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid gap-5"
            >
              <div className="grid gap-2">
                <label htmlFor="otp" className="text-sm font-medium text-slate-800">
                  OTP
                </label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={formData.otp || ""}
                  onChange={(value) => {
                    handleInputChange('otp', value);
                    // Clear OTP error when user starts typing
                    if (errors.otp) {
                      setErrors(prev => ({ ...prev, otp: '' }));
                    }
                  }}
                  className="flex gap-2"
                >
                  <InputOTPGroup className="flex gap-2">
                    {Array(6)
                      .fill(null)
                      .map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-11 w-11 rounded-lg border border-slate-200 bg-white text-center text-lg font-medium outline-none ring-0 transition-shadow"
                        />
                      ))}
                  </InputOTPGroup>
                </InputOTP>
                {errors.otp && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600"
                  >
                    {errors.otp}
                  </motion.p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}