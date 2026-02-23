'use client';


import { createContext, useContext, useState, ReactNode } from 'react';


export type User = {
    id: string;
    email: string;
} | null;

type UserContextType = {
    user: User;
    setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ 
    children,
    initialUser,
}: { 
    children: ReactNode;
    initialUser: User;
}) => {
    const [user, setUser] = useState<User>(initialUser);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};