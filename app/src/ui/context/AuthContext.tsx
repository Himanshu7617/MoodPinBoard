import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
interface AuthContextType {
    isLoggedIn: boolean;
    login: () => Promise<void>;
    logout: () => void;
    checkLoginStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const checkLoginStatus = async () => {
        const token = await window.electron.store.get("pinterestAccessToken");
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    };

    const login = async () => {
        try {
            const res = await window.electron.pinterestAuth();
            if (res.message === "success") {
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = () => {
        // Implement logout logic if needed (e.g., clear token)
        // window.electron.store.delete("pinterestAccessToken");
        setIsLoggedIn(false);
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, checkLoginStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
