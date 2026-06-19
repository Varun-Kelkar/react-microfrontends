import React from 'react';
import { SignIn } from '@clerk/clerk-react';


const SignInPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
