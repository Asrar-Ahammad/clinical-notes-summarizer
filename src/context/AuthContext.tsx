
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const token = localStorage.getItem('kiro_auth_token');
        const storedUser = localStorage.getItem('kiro_user');

        if (token && storedUser) {
            setState({
                token,
                user: JSON.parse(storedUser),
                isAuthenticated: true,
            });
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock JWT token
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token';
        const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email: email,
            role: 'clinician',
            avatar: 'DR'
        };

        localStorage.setItem('kiro_auth_token', mockToken);
        localStorage.setItem('kiro_user', JSON.stringify(mockUser));

        setState({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true,
        });
    };

    const signup = async (name: string, email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock JWT token
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_signup_token';
        const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            role: 'clinician',
            avatar: name.charAt(0).toUpperCase()
        };

        localStorage.setItem('kiro_auth_token', mockToken);
        localStorage.setItem('kiro_user', JSON.stringify(mockUser));

        setState({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true,
        });
    };

    const logout = () => {
        localStorage.removeItem('kiro_auth_token');
        localStorage.removeItem('kiro_user');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, signup, logout, isLoading }}>
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
