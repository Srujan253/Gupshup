import { AlertTriangle, LogOut, X } from "lucide-react";

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-base-100 rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-base-content">
            Confirm Logout
          </h3>

          {/* Message */}
          <p className="text-base-content/70">
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-error flex-1"
            >
              <LogOut className="w-4 h-4" />
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;