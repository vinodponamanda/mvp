import React from 'react';
import AuthModal from '../auth/AuthModal';

// Re-export AuthModal to maintain compatibility across legacy imports
export default function PhoneOtpModal(props) {
  return <AuthModal {...props} />;
}
