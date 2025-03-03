import client, { cfg } from './aw/client';
import { Account, Client, Databases, ID, Query, Permission, Role } from 'react-native-appwrite';

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


const account = new Account(client);
const databases = new Databases(client);

export const updateUser = async (userData, userId) => {
    try {

        await databases.updateDocument(
            databaseId,
            userCollectionId,
            userId,
            userData
        );
    } catch (error) {
        console.error('Failed to update user data:', error);
        throw error;
    }
};

export const getUser = async (userId) => {
    try {
        const user = await databases.getDocument(
            databaseId,
            userCollectionId,
            userId
        );
        return user;
    } catch (error) {
        console.error('Failed to retrieve user:', error);
        throw error;
    }
};


export const getUserSessionIds_bySession = async (sessionId) => {
    try {
        const userSessions = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', sessionId)]
        );
        return userSessions.documents.map(session => session.$id);
    } catch (error) {
        console.error('Failed to retrieve user session IDs:', error);
        throw error;
    }
}

export const getSessionDrinks = async (sessionId) => {
    try {
        const userSessions = await getUserSessionIds_bySession(sessionId);
        if (userSessions.length === 0) {
            return [];
        }
        const drinkQuantity = {};
        for (const userSession of userSessions) {
            const drinks = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [Query.equal('userSession', userSession)]
            );

            for (const drink of drinks.documents) {
                const drinkId = drink.drink.$id;
                const drinkDetails = await databases.getDocument(
                    databaseId,
                    drinksCollectionId,
                    drinkId
                );
                const drinkName = drinkDetails.name;

                if (drinkQuantity[drinkName]) {
                    drinkQuantity[drinkName].quantity += drink.quantity;
                } else {
                    drinkQuantity[drinkName] = {
                        name: drinkName,
                        quantity: drink.quantity
                    };
                }
            }
        }

        const result = Object.values(drinkQuantity);

        return result;
    } catch (error) {
        console.error('Failed to retrieve session drinks:', error);
        throw error;
    }
}



