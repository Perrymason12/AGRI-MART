import React from 'react';
import { ClerkProvider, ClerkLoaded, ClerkLoading, ClerkFailed } from '@clerk/clerk-react';

const ClerkErrorBoundary = ({ children, publishableKey }) => {
  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Clerk Publishable Key is missing. Please check your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          rootBox: "mx-auto",
        }
      }}
    >
      <ClerkLoading>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </ClerkLoading>
      <ClerkFailed>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Service Unavailable</h2>
            <p className="text-gray-600 mb-4">
              We're having trouble connecting to the authentication service. This could be due to:
            </p>
            <ul className="text-left text-gray-600 mb-6 space-y-2">
              <li>• Network connectivity issues</li>
              <li>• Ad blocker or browser extension blocking scripts</li>
              <li>• Temporary service outage</li>
            </ul>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Continue without authentication (guest mode)
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </ClerkFailed>
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default ClerkErrorBoundary;

