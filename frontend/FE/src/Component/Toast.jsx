import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600/90';
      case 'error':
        return 'bg-red-600/90';
      default:
        return 'bg-slate-600/90';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 ${getBgColor()} backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg border border-opacity-20 border-white flex items-center space-x-3 max-w-md z-50 animate-slide-up`}>
      {getIcon()}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;