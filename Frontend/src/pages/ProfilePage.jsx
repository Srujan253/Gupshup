import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit3, Check, X, ArrowLeft, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiCall } from "../lib/api.js";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, updateUsername } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(authUser?.fullname || "");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: new password
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      return;
    }
    if (newUsername.trim() === authUser?.fullname) {
      setIsEditingUsername(false);
      return;
    }
    
    await updateUsername(newUsername.trim());
    setIsEditingUsername(false);
  };

  const cancelUsernameEdit = () => {
    setNewUsername(authUser?.fullname || "");
    setIsEditingUsername(false);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  // Password Update Functions
  const handleRequestPasswordOTP = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall("/api/auth/request-password-otp", {
        method: "POST",
        body: JSON.stringify({ email: authUser.email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP sent to your email!");
        setPasswordStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error requesting password OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndUpdatePassword = async () => {
    if (!otpCode || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall("/api/auth/update-password", {
        method: "POST",
        body: JSON.stringify({
          email: authUser.email,
          otp: otpCode,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordStep(1);
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordStep(1);
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center relative">
            {/* Back Arrow */}
            <button
              onClick={handleGoBack}
              className="absolute left-0 top-0 btn btn-ghost btn-sm"
              title="Back to Messages"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditingUsername ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border focus:outline-none focus:border-primary"
                    placeholder="Enter your name"
                    disabled={isUpdatingProfile}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUsernameUpdate();
                      if (e.key === 'Escape') cancelUsernameEdit();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={isUpdatingProfile || !newUsername.trim()}
                    className="btn btn-sm btn-primary"
                  >
                    {isUpdatingProfile ? (
                      <div className="loading loading-spinner loading-xs"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={cancelUsernameEdit}
                    disabled={isUpdatingProfile}
                    className="btn btn-sm btn-ghost"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border">
                    {authUser?.fullname}
                  </p>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="btn btn-sm btn-ghost"
                    disabled={isUpdatingProfile}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Password</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-sm btn-outline btn-primary"
                  disabled={isUpdatingProfile}
                >
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Update Password
              </h3>
              <button
                onClick={resetPasswordModal}
                className="btn btn-ghost btn-sm"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-base-content/70">
                  We'll send a verification code to your email address: <strong>{authUser?.email}</strong>
                </p>
                <button
                  onClick={handleRequestPasswordOTP}
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </div>
            )}

            {passwordStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter 6-digit verification code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="input input-bordered w-full text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input input-bordered w-full"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input input-bordered w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPasswordStep(1)}
                    className="btn btn-ghost flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOTPAndUpdatePassword}
                    className="btn btn-primary flex-1"
                    disabled={isLoading || !otpCode || !newPassword || !confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;