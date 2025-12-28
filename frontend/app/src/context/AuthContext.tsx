import React, { createContext, useState, useContext } from "react";
import type {ReactNode} from "react";

interface User {
    name: string;
    studentId: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedin: boolean;
    login: (name: string, studentId: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : {children : ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (name: string, studentId: string) => {
        setUser({name, studentId});
        return true;
    };

    const logout = () => {
        setUser(null);
        return true;
    };

    return (
        <AuthContext.Provider value={{user, isLoggedin: !!user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}