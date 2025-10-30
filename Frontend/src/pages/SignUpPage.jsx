import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  MessageSquare,
  User,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import OTPVerification from "../components/OTPVerification.jsx";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState("signup"); // "signup" or "otp"
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { 
    signup, 
    isSigningUp, 
    verifyOTPAndCreateAccount, 
    isVerifyingOTP, 
    resendOTP, 
    isSendingOTP,
    pendingUser 
  } = useAuthStore();

  const validateForm = () => {
   if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const success = validateForm();
    if (success === true) {
      const result = await signup(formData);
      if (result.success) {
        setCurrentStep("otp");
      }
    }
  };

  const handleOTPVerify = async (otp) => {
    const result = await verifyOTPAndCreateAccount(otp);
    if (result.success) {
      // Account created successfully, user will be redirected by auth flow
    }
  };

  const handleResendOTP = async () => {
    await resendOTP();
  };

  const handleBackToSignup = () => {
    setCurrentStep("signup");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-200 text-base-content">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <AnimatePresence mode="wait">
          {currentStep === "signup" ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="size-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                  <p className="text-base-content/60">
                    Get started with your free account
                  </p>
                </motion.div>
              </div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Full Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="form-control"
                >
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="relative h-12">
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 h-full bg-base-100 text-base-content 
               focus:border-primary"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                    <div className="absolute top-1/2 left-3 -translate-y-1/2  rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="size-5 text-base-content" />
                    </div>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="form-control"
                >
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative h-12">
                    <input
                      type="email"
                      className="input input-bordered w-full pl-10 h-full bg-base-100 text-base-content focus:border-primary"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <div className="absolute top-1/2 left-3 -translate-y-1/2">
                      <Mail className="size-5 text-base-content" />
                    </div>
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="form-control"
                >
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`input input-bordered w-full pl-10 focus:border-primary`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-5 text-base-content/40" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 text-base-content/40" />
                      ) : (
                        <Eye className="size-5 text-base-content/40" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Create Account Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSigningUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSigningUp ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </motion.button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-base-content/60">
                  Already have an account?{" "}
                  <Link to="/login" className="link link-primary">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <OTPVerification
              key="otp"
              email={formData.email}
              onVerify={handleOTPVerify}
              onBack={handleBackToSignup}
              isVerifying={isVerifyingOTP}
              onResendOTP={handleResendOTP}
            />
          )}
        </AnimatePresence>
      </div>

      <AuthImagePattern
        title="Join the Conversation"
        subtitle="Connect with friends and communities stay touched with the loved ones and have fun"
      />
    </div>
  );
};

export default SignUpPage;
