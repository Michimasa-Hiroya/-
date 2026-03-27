import React from 'react';

export const FirebaseError = () => {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center p-4 text-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-red-800 mb-2">Firebase Configuration Error</h1>
        <p className="text-gray-700 mb-6">
          The application could not connect to Firebase. This is likely because the Firebase configuration has not been set up correctly.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <h2 className="font-semibold text-gray-800 mb-2">Action Required:</h2>
          <p className="text-sm text-gray-600">
            Please open the <code className="bg-gray-200 text-red-700 font-mono p-1 rounded">firebaseConfig.ts</code> file in your project and replace the placeholder values with your actual Firebase project credentials.
          </p>
        </div>
         <p className="text-xs text-gray-500 mt-6">
            You can find these credentials in your Firebase project console under Project settings &gt; General &gt; Your apps &gt; Web app.
        </p>
      </div>
    </div>
  );
};