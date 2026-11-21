
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import { profiles } from '../data/profiles';
import { useProfile } from './ProfileContext';

type DiscoveryContextType = {
  likedProfileIds: string[];
  isLiked: (profileId: string) => boolean;
  toggleLike: (profileId: string) => void;
  sampleProfileStatuses: Record<string, boolean>;
  isSampleProfileOnline: (profileId: string) => boolean;
};

type DiscoveryProviderProps = {
  children: ReactNode;
};

const DiscoveryContext = createContext<
  DiscoveryContextType | undefined
>(undefined);

export function DiscoveryProvider({
  children,
}: DiscoveryProviderProps) {
  const { currentUserId } = useProfile();

  // Store likes separately for each logged-in account
  const [likesByUser, setLikesByUser] = useState<
    Record<string, string[]>
  >({});

  // Randomly assign sample profile statuses once per app session
  const [sampleProfileStatuses] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(
      profiles.map((profile) => [
        profile.id,
        Math.random() < 0.5,
      ])
    );
  });

  const likedProfileIds = currentUserId
    ? likesByUser[currentUserId] ?? []
    : [];

  // Check whether the current user likes a profile
  const isLiked = (profileId: string) => {
    return likedProfileIds.includes(profileId);
  };

  // Like or unlike a profile for the current account only
  const toggleLike = (profileId: string) => {
    if (!currentUserId) {
      return;
    }

    setLikesByUser((previous) => {
      const currentLikes = previous[currentUserId] ?? [];

      const updatedLikes = currentLikes.includes(profileId)
        ? currentLikes.filter((id) => id !== profileId)
        : [...currentLikes, profileId];

      return {
        ...previous,
        [currentUserId]: updatedLikes,
      };
    });
  };

  // Check whether a sample profile is online
  const isSampleProfileOnline = (profileId: string) => {
    return sampleProfileStatuses[profileId] ?? false;
  };

  return (
    <DiscoveryContext.Provider
      value={{
        likedProfileIds,
        isLiked,
        toggleLike,
        sampleProfileStatuses,
        isSampleProfileOnline,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);

  if (!context) {
    throw new Error(
      'useDiscovery must be used inside DiscoveryProvider'
    );
  }

  return context;
}
