import React from 'react';
import { UserProfile } from '@clerk/clerk-react';


const ProfilePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <UserProfile
        routing="path"
        path="/profile"
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-4xl',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
};

export default ProfilePage;
