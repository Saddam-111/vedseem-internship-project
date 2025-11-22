import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xl font-semibold text-yellow-600">Loading...</span>
      </div>
    </div>
  );
}

export default Loading;
