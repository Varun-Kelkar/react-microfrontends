import React from 'react';
import { SignUp } from '@clerk/clerk-react';


const SignUpPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
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

export default SignUpPage;
