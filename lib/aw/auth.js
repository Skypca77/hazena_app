/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { cfg, databases, account } from './client';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';
import { } from './index';


// Can be copy-pasted, some will not be used
// unfortunate :[
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

export const createUser = async (email, password, username) => {
    try {
        if (isSessionActive()) {
            sign_out();
        }

        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if (!newAccount) {
            throw Error;
        }

        await sign_in(email, password);

        const newUser = await databases.createDocument(
            cfg.databaseId, 
            cfg.userCollectionId, 
            ID.unique(), 
            {
                accountId: newAccount.$id, 
                email, 
                username
            }
        );

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}


export async function sign_in(email, password) {
    try {
        if (await isSessionActive()) {
            await sign_out();
        }

        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}


export async function isSessionActive() {
    try {
        const session = await account.get();
        console.log('Session is active:', session);
        return true;
    } catch (error) {
        if (error.code === 401) {
            console.log('No active session.');
            return false;
        } else {
            console.error('Error checking session:', error);
            throw error;
        }
    }
};

export async function sign_out() {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.error('Failed to end session:', error);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        return currentUser.documents[0];
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};