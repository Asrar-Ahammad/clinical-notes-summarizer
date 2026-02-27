
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoAuthService } from '../services/CognitoAuthService';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    confirmSignUp: (email: string, code: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing Cognito session on mount
        const restoreSession = async () => {
            try {
                const cognitoUser = await CognitoAuthService.getCurrentUser();
                setState({
                    token: 'cognito-session', // Amplify manages actual tokens
                    user: {
                        id: cognitoUser.id,
                        name: cognitoUser.name,
                        email: cognitoUser.email,
                        role: 'clinician',
                        avatar: cognitoUser.name.charAt(0).toUpperCase(),
                    },
                    isAuthenticated: true,
                });
            } catch {
                // No existing session — stay unauthenticated
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const cognitoUser = await CognitoAuthService.signIn(email, password);
            setState({
                token: 'cognito-session',
                user: {
                    id: cognitoUser.id,
                    name: cognitoUser.name,
                    email: cognitoUser.email,
                    role: 'clinician',
                    avatar: cognitoUser.name.charAt(0).toUpperCase(),
                },
                isAuthenticated: true,
            });
        } catch (err: any) {
            const message = err?.message || 'Sign-in failed. Please check your credentials.';
            setError(message);
            throw err;
        }
    };

    /**
     * Returns true if sign-up is complete (auto-confirmed),
     * false if email confirmation is required.
     */
    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        setError(null);
        try {
            const { isConfirmed } = await CognitoAuthService.signUp(name, email, password);
            return isConfirmed;
        } catch (err: any) {
            const message = err?.message || 'Sign-up failed. Please try again.';
            setError(message);
            throw err;
        }
    };

    const confirmSignUpCode = async (email: string, code: string) => {
        setError(null);
        try {
            await CognitoAuthService.confirmSignUp(email, code);
        } catch (err: any) {
            const message = err?.message || 'Verification failed. Please check the code.';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await CognitoAuthService.signOut();
        } catch {
            // Even if sign-out fails server-side, clear local state
        }
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            signup,
            confirmSignUp: confirmSignUpCode,
            logout,
            isLoading,
            error,
            clearError,
        }}>
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
