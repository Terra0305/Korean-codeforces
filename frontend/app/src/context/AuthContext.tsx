import { createContext, useState, useContext, useEffect } from "react";
import type {ReactNode} from "react";
import client from "../api/client";
import { LoginResponse, Profile } from "../types/auth.d";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

interface User {
    id: number;
    username: string;
    is_staff: boolean;
    profile: Profile;
}

interface AuthContextType {
    user: User | null;
    isLoggedin: boolean;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : {children : ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await client.get('/api/users/me/');
                if (response.status === 200) {
                    const userData = response.data;
                    setUser(userData); 
                    client.defaults.headers.common['x-csrftoken'] = cookies.get('csrftoken');
                }
            } catch (error) {
                if(user){
                    alert("세션이 만료되었습니다.");
                }
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try{
            setIsLoading(true);
            const response = await client.post<LoginResponse>("/api/users/login/", {username, password});
            if (response.status === 200) {
                setUser(response.data.user);
                client.defaults.headers.common['x-csrftoken'] = cookies.get('csrftoken');
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
             await client.post('/api/users/logout/');
        } catch (error) {
             console.error("Logout failed", error);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, isLoggedin: !!user, isLoading, setIsLoading, login, logout}}>
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