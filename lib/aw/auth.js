import { cfg, databases, account } from './client';
import { ID, Query } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extracting configuration variables (good for readability)
const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    userSessionId,
    userDrinkSessionId,
    inviteCollectionId,
    sessionCollectionId,
    drinksCollectionId,
    friendsCollectionId,
    drinkTimeTableCollectionId,
    storageId,
    drinkId,
} = cfg;

/**
 * Creates a new user in the system
 * @param {string} email - The email address of the user.
 * @param {string} password - The password for the user.
 * @param {string} username - The username for the user.
 * @returns {Object} The newly created user document.
 */
export const createUser = async (email, password, username) => {
    try {
        // Ensure no session is active before creating a user
        if (await isSessionActive()) {
            await sign_out_sesh();
        }

        // Create the account using Appwrite's API
        const newAccount = await account.create(ID.unique(), email.trim(), password, username.trim());

        if (!newAccount) {
            throw new Error('Account creation failed');
        }

        // Sign the user in after successful account creation.
        // sign_in also makes sure the user document exists in the database.
        await sign_in(email, password);

        return await getCurrentUser();
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error(error.message || 'Unknown error during user creation');
    }
}

/**
 * Makes sure that a document in the user collection exists for the given account.
 * Accounts without this document (e.g. when sign up failed half way) would
 * otherwise be logged in, but every screen would fail to load.
 * @param {Object} acc - Appwrite account object
 * @returns {Object} The user document.
 */
const ensureUserDocument = async (acc) => {
    const existing = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.equal('accountId', acc.$id)]
    );

    if (existing.documents.length > 0) {
        return existing.documents[0];
    }

    return await databases.createDocument(
        databaseId,
        userCollectionId,
        ID.unique(),
        {
            accountId: acc.$id,
            email: acc.email,
            username: acc.name || acc.email.split('@')[0],
        }
    );
}

/**
 * Signs in a user with email and password
 * @param {string} email - The email of the user to sign in.
 * @param {string} password - The password of the user.
 * @returns {Object} The session object after successful sign in.
 */
export async function sign_in(identifier, password) {
    try {
        if (!identifier || !password) {
            throw new Error("Email/username and password are required.");
        }

        const trimmedIdentifier = identifier.trim();
        let emailToUse = trimmedIdentifier;

        // Rozpoznání, zda je zadaný vstup e-mail
        const isEmail = /\S+@\S+\.\S+/.test(trimmedIdentifier);

        if (!isEmail) {
            // Pokud není email, hledáme odpovídající email podle username v databázi
            const users = await databases.listDocuments(
                cfg.databaseId,
                cfg.userCollectionId,
                [Query.equal('username', trimmedIdentifier)]
            );

            if (users.total === 0) {
                throw new Error("User not found.");
            }

            emailToUse = users.documents[0].email; // Použijeme email nalezeného uživatele
        }

        if (await isSessionActive()) {
            await sign_out_sesh();
        }

        const session = await account.createEmailPasswordSession(emailToUse, password);

        // Repair accounts that have no user document (broken sign up)
        await ensureUserDocument(await account.get());

        return session;
    } catch (error) {
        console.error("Error signing in:", error);
        throw new Error(error.message);
    }
}

/**
 * Checks if a session is active
 * @returns {boolean} Whether the user has an active session.
 */
export async function isSessionActive() {
    try {
        await account.get();
        return true;
    } catch (error) {
        if (error.code === 401) {
            return false;
        } else {
            console.error('Error checking session:', error);
            throw new Error(error.message || 'Unknown error during session check');
        }
    }
}

/**
 * Signs out the currently active session
 */
export async function sign_out_sesh() {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.error('Failed to end session:', error);
        throw new Error('Failed to end session');
    }
}

/**
 * Signs out the current user and clears locally cached user data
 */
export async function sign_out() {
    try {
        await account.deleteSession('current');
    } catch (error) {
        // 401 = there is no session anymore, which is what we want anyway
        if (error?.code !== 401) {
            console.error('Failed to sign out:', error);
            throw new Error(error?.message || 'Failed to sign out');
        }
    } finally {
        await AsyncStorage.removeItem('currentUser').catch(() => {});
    }
}

export const getCurrentUser = async () => {
    try {
        // Pokud je session aktivní, získáme data uživatele
        const currentAccount = await account.get();
        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        return currentUser.documents[0] || null;
    } catch (error) {
        // 401 just means that nobody is logged in
        if (error?.code !== 401) {
            console.error('Chyba při získávání uživatele:', error);
        }
        return null;
    }
};