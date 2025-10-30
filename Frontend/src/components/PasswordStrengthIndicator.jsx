import { useMemo } from 'react';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';

const PasswordStrengthIndicator = ({ password, showLabel = true }) => {
  const analysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        strength: 'none',
        color: 'bg-gray-300',
        textColor: 'text-gray-500',
        percentage: 0,
        requirements: [],
        feedback: 'Enter a password to see strength'
      };
    }

    const requirements = [
      {
        test: password.length >= 8,
        text: 'At least 8 characters',
        met: password.length >= 8
      },
      {
        test: /[a-z]/.test(password),
        text: 'Lowercase letter (a-z)',
        met: /[a-z]/.test(password)
      },
      {
        test: /[A-Z]/.test(password),
        text: 'Uppercase letter (A-Z)',
        met: /[A-Z]/.test(password)
      },
      {
        test: /\d/.test(password),
        text: 'Number (0-9)',
        met: /\d/.test(password)
      },
      {
        test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        text: 'Special character (!@#$%^&*)',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    let score = 0;
    let strength = '';
    let color = '';
    let textColor = '';
    let feedback = '';

    // Calculate score based on requirements met and password length
    if (password.length < 6) {
      score = 1;
      strength = 'Very Weak';
      color = 'bg-red-500';
      textColor = 'text-red-500';
      feedback = 'Password too short';
    } else if (metRequirements <= 2) {
      score = 2;
      strength = 'Weak';
      color = 'bg-red-400';
      textColor = 'text-red-400';
      feedback = 'Add more character types';
    } else if (metRequirements === 3) {
      score = 3;
      strength = 'Fair';
      color = 'bg-yellow-500';
      textColor = 'text-yellow-500';
      feedback = 'Almost there!';
    } else if (metRequirements === 4) {
      score = 4;
      strength = 'Good';
      color = 'bg-blue-500';
      textColor = 'text-blue-500';
      feedback = 'Good password strength';
    } else if (metRequirements === 5 && password.length >= 12) {
      score = 5;
      strength = 'Excellent';
      color = 'bg-green-600';
      textColor = 'text-green-600';
      feedback = 'Excellent security!';
    } else {
      score = 4;
      strength = 'Strong';
      color = 'bg-green-500';
      textColor = 'text-green-500';
      feedback = 'Strong password';
    }

    return {
      score,
      strength,
      color,
      textColor,
      percentage: (score / 5) * 100,
      requirements,
      feedback,
      metRequirements
    };
  }, [password]);

  const getStrengthIcon = () => {
    if (analysis.score <= 2) return <X className="w-4 h-4" />;
    if (analysis.score <= 3) return <AlertTriangle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {showLabel && (
            <div className={`flex items-center gap-2 text-sm font-medium ${analysis.textColor}`}>
              {getStrengthIcon()}
              <span>Password Strength: {analysis.strength}</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${analysis.color}`}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>

        {/* Feedback */}
        <p className={`text-xs ${analysis.textColor}`}>
          {analysis.feedback}
        </p>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 mb-2">Password Requirements:</p>
        <div className="grid grid-cols-1 gap-1">
          {analysis.requirements.map((req, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                req.met ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                req.met ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {req.met ? (
                  <Check className="w-2.5 h-2.5 text-green-600" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                )}
              </div>
              <span className={req.met ? 'line-through' : ''}>{req.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Score */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">Security Score:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full ${
                dot <= analysis.score ? analysis.color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;