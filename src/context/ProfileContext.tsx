
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

export type UserProfile = {
  name: string;
  age: string;
  gender: string;
  relationshipStatus: string;
  aboutMe: string;
  favorites: string;
  hobbies: string;
  birthdate: string;
};

type DemoAccount = {
  id: string;
  username: string;
  password: string;
  profile: UserProfile;
};

export type DemoProfile = {
  id: string;
  profile: UserProfile;
};

type ProfileContextType = {
  profile: UserProfile | null;
  currentUserId: string | null;
  isAuthenticated: boolean;
  demoProfiles: DemoProfile[];
  isOnline: (userId: string) => boolean;
  login: (username: string, password: string) => boolean;
    registerAccount: (
    username: string,
    password: string,
    profile: UserProfile
  ) => boolean;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
};

const initialAccounts: DemoAccount[] = [
  {
    id: 'user1',
    username: 'user1',
    password: 'mate123',
    profile: {
      name: 'Justin',
      age: '21',
      gender: 'Male',
      relationshipStatus: 'Single',
      aboutMe: 'I enjoy meeting new people and learning new things.',
      favorites: 'Music, movies, and coffee',
      hobbies: 'Gaming and listening to music',
      birthdate: 'January 15, 2005',
    },
  },
  {
    id: 'user2',
    username: 'user2',
    password: 'mate456',
    profile: {
      name: 'Alex',
      age: '22',
      gender: 'Male',
      relationshipStatus: 'Single',
      aboutMe: 'I enjoy exploring new places and trying new things.',
      favorites: 'Travel, photography, and food',
      hobbies: 'Photography and hiking',
      birthdate: 'March 10, 2004',
    },
  },
  {
    id: 'user3',
    username: 'user3',
    password: 'mate789',
    profile: {
      name: 'Sam',
      age: '23',
      gender: 'Female',
      relationshipStatus: 'Single',
      aboutMe: 'I love creative activities and spending time outdoors.',
      favorites: 'Books, art, and nature',
      hobbies: 'Drawing and reading',
      birthdate: 'July 20, 2003',
    },
  },
];

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [accounts, setAccounts] = useState<DemoAccount[]>(initialAccounts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentAccount = accounts.find(
    (account) => account.id === currentUserId
  );

  // Check whether a demo account is currently logged in
  const isOnline = (userId: string) => {
    return currentUserId === userId;
  };

  // Share profile information without exposing login credentials
  const demoProfiles: DemoProfile[] = accounts.map((account) => ({
    id: account.id,
    profile: account.profile,
  }));

  const login = (username: string, password: string) => {
    const matchingAccount = accounts.find(
      (account) =>
        account.username.toLowerCase() === username.trim().toLowerCase() &&
        account.password === password
    );

    if (!matchingAccount) {
      return false;
    }

    setCurrentUserId(matchingAccount.id);
    return true;
  };

    const registerAccount = (
    username: string,
    password: string,
    profile: UserProfile
  ) => {
    const normalizedUsername = username.trim();

    // Prevent duplicate usernames
    const usernameExists = accounts.some(
      (account) =>
        account.username.toLowerCase() ===
        normalizedUsername.toLowerCase()
    );

    if (!normalizedUsername || usernameExists) {
      return false;
    }

    const newAccount: DemoAccount = {
      id: `user-${Date.now()}`,
      username: normalizedUsername,
      password,
      profile,
    };

    setAccounts((previousAccounts) => [
      ...previousAccounts,
      newAccount,
    ]);

    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const setProfile = (updatedProfile: UserProfile) => {
    if (!currentUserId) return;

    setAccounts((previousAccounts) =>
      previousAccounts.map((account) =>
        account.id === currentUserId
          ? { ...account, profile: updatedProfile }
          : account
      )
    );
  };

  return (
    <ProfileContext.Provider
      value={{
        profile: currentAccount?.profile ?? null,
        currentUserId,
        isAuthenticated: Boolean(currentAccount),
        demoProfiles,
        isOnline,
        login,
        registerAccount,
        logout,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      'useProfile must be used inside ProfileProvider'
    );
  }

  return context;
}
