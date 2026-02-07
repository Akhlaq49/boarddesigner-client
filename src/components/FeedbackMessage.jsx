import React, { useEffect } from 'react';

function FeedbackMessage({ feedback }) {
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        // Auto-hide after 3 seconds
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (!feedback.message) return null;

  return (
    <div className={`drag-feedback drag-feedback-${feedback.type} ${feedback.show ? 'show' : ''}`}>
      {feedback.message}
    </div>
  );
}

export default FeedbackMessage;

