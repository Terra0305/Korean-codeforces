import { createContext, useState, useContext } from "react";
import type {ReactNode} from "react";
import client from "../api/client";
import { LoginResponse, Profile } from "../types/auth.d";

interface User {
    id: number;
    username: string;
    profile: Profile;
}

interface AuthContextType {
    user: User | null;
    isLoggedin: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : {children : ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (username: string, password: string): Promise<boolean> => {
        try{
            const response = await client.post<LoginResponse>("/users/login/", {username, password});
            if (response.status === 200) {
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
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