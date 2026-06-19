import React, { useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { EventBus } from '@mfe-demo/shared/eventBus';


const UserMenu: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const prevSignedIn = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (prevSignedIn.current === undefined) {
      prevSignedIn.current = isSignedIn;
      if (isSignedIn && user) {
        EventBus.emit('auth:login', {
          userId: user.id,
          name: user.fullName || user.firstName || 'User',
          email: user.primaryEmailAddress?.emailAddress || '',
        });
      }
      return;
    }

    if (isSignedIn && !prevSignedIn.current && user) {
      EventBus.emit('auth:login', {
        userId: user.id,
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
      });
    } else if (!isSignedIn && prevSignedIn.current) {
      EventBus.emit('auth:logout', null);
    }

    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'w-8 h-8',
        },
      }}
    />
  );
};

export default UserMenu;
