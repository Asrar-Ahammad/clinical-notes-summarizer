import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, confirmSignUp, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// Configure Amplify with Cognito settings from environment variables
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        },
    },
});

export interface CognitoUser {
    id: string;
    name: string;
    email: string;
}

// Store the username from the most recent sign-up for confirmation
let _pendingUsername: string | null = null;

export const CognitoAuthService = {
    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<CognitoUser> {
        const { isSignedIn } = await signIn({ username: email, password });

        if (!isSignedIn) {
            throw new Error('Sign-in was not completed. Please check your credentials.');
        }

        return await CognitoAuthService.getCurrentUser();
    },

    /**
     * Sign up a new user
     */
    async signUp(name: string, email: string, password: string): Promise<{ isConfirmed: boolean; username: string }> {
        // Cognito with email alias requires a non-email username
        const username = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const { isSignUpComplete } = await signUp({
            username,
            password,
            options: {
                userAttributes: {
                    email,
                    name,
                },
            },
        });

        // Store for confirmSignUp
        _pendingUsername = username;

        return { isConfirmed: isSignUpComplete, username };
    },

    /**
     * Confirm sign-up with verification code sent to email
     */
    async confirmSignUp(email: string, code: string): Promise<void> {
        // Use the stored username from signUp, fall back to email
        const username = _pendingUsername || email;

        const { isSignUpComplete } = await confirmSignUp({
            username,
            confirmationCode: code,
        });

        if (!isSignUpComplete) {
            throw new Error('Confirmation failed. Please try again.');
        }

        _pendingUsername = null;
    },

    /**
     * Sign out the current user
     */
    async signOut(): Promise<void> {
        await signOut();
    },

    /**
     * Get the currently authenticated user (for session restoration)
     */
    async getCurrentUser(): Promise<CognitoUser> {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();

        return {
            id: user.userId,
            name: attributes.name || attributes.email || 'User',
            email: attributes.email || '',
        };
    },
};
