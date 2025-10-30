import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const OTPVerification = ({ email, onVerify, onBack, isVerifying, onResendOTP }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6 && /^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    
    onVerify(otpString);
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    try {
      await onResendOTP();
      setTimeLeft(300); // Reset timer
      setOtp(['', '', '', '', '', '']); // Clear OTP
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Shield className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
          <p className="text-base-content/60 text-center">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-primary font-medium">{email}</p>
        </motion.div>
      </div>

      {/* OTP Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* OTP Input Fields */}
        <div className="space-y-4">
          <label className="label">
            <span className="label-text font-medium">Enter verification code</span>
          </label>
          
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg 
                         focus:border-primary focus:outline-none transition-colors
                         bg-base-100 text-base-content"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileFocus={{ scale: 1.1 }}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          {timeLeft > 0 ? (
            <p className="text-sm text-base-content/60">
              Code expires in{' '}
              <span className="font-mono font-bold text-warning">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-error">Code has expired</p>
          )}
        </motion.div>

        {/* Verify Button */}
        <motion.button
          type="submit"
          disabled={isVerifying || otp.join('').length !== 6}
          className="btn btn-primary w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Account'
          )}
        </motion.button>

        {/* Resend OTP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-base-content/60">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={timeLeft > 0 || isResending}
            className="btn btn-ghost btn-sm"
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                Resend Code
              </>
            )}
          </button>
        </motion.div>

        {/* Back Button */}
        <motion.button
          type="button"
          onClick={onBack}
          className="btn btn-ghost w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="size-4" />
          Back to Sign Up
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default OTPVerification;