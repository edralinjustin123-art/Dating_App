
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import { useChat } from './ChatContext';
import { useProfile } from './ProfileContext';

type MateContextType = {
  mates: Record<string, string>;
  agreements: Record<string, string[]>;

  currentMateId: string | null;

  hasAgreed: (otherUserId: string) => boolean;
  becomeMates: (otherUserId: string) => void;
  unmate: () => void;
};

const MateContext = createContext<MateContextType | undefined>(
  undefined
);

type MateProviderProps = {
  children: ReactNode;
};

export function MateProvider({ children }: MateProviderProps) {
  const { currentUserId } = useProfile();
  const { hasBothSentMessages } = useChat();

  const [mates, setMates] = useState<Record<string, string>>({});

  const [agreements, setAgreements] = useState<
    Record<string, string[]>
  >({});

  const currentMateId = currentUserId
    ? mates[currentUserId] ?? null
    : null;

  function hasAgreed(otherUserId: string) {
    if (!currentUserId) {
      return false;
    }

    const pairId = [currentUserId, otherUserId]
      .sort()
      .join('_');

    return (agreements[pairId] ?? []).includes(currentUserId);
  }

  function becomeMates(otherUserId: string) {
    if (
      !currentUserId ||
      !otherUserId ||
      currentUserId === otherUserId
    ) {
      return;
    }

    // Both users must have sent at least one message
    if (!hasBothSentMessages(otherUserId)) {
      return;
    }

    // Neither user can already have another Mate
    if (mates[currentUserId] || mates[otherUserId]) {
      return;
    }

    const pairId = [currentUserId, otherUserId]
      .sort()
      .join('_');

    const currentAgreements = agreements[pairId] ?? [];

    const updatedAgreements = currentAgreements.includes(
      currentUserId
    )
      ? currentAgreements
      : [...currentAgreements, currentUserId];

    setAgreements((previous) => ({
      ...previous,
      [pairId]: updatedAgreements,
    }));

    // Only establish the relationship after both users agree
    if (updatedAgreements.length === 2) {
      setMates((previous) => {
        if (
          previous[currentUserId] ||
          previous[otherUserId]
        ) {
          return previous;
        }

        return {
          ...previous,
          [currentUserId]: otherUserId,
          [otherUserId]: currentUserId,
        };
      });
    }
  }

  function unmate() {
    if (!currentUserId) {
      return;
    }

    const otherUserId = mates[currentUserId];

    if (!otherUserId) {
      return;
    }

    const pairId = [currentUserId, otherUserId]
      .sort()
      .join('_');

    setMates((previous) => {
      const updated = { ...previous };

      delete updated[currentUserId];
      delete updated[otherUserId];

      return updated;
    });

    // Reset both users' agreements for this relationship
    setAgreements((previous) => {
      const updated = { ...previous };

      delete updated[pairId];

      return updated;
    });
  }

  return (
    <MateContext.Provider
      value={{
        mates,
        agreements,
        currentMateId,
        hasAgreed,
        becomeMates,
        unmate,
      }}
    >
      {children}
    </MateContext.Provider>
  );
}

export function useMate() {
  const context = useContext(MateContext);

  if (!context) {
    throw new Error(
      'useMate must be used inside a MateProvider'
    );
  }

  return context;
}
