/************************/
/*  Name: Tomáš Skýpala */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { cfg, databases, account } from './client';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';
import { getUser, addInvite, getActiveSession, addSession, addUserSession, getCurrentUser  } from './index';


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


export const getAllUsersRelatedToSession = async (sessionId) => {
    try {
        const invites = await databases.listDocuments(
            databaseId,
            inviteCollectionId,
            [Query.equal('session_id', sessionId)]
        )

        const attendants = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', sessionId)]
        )

        const users = [];

        invites.documents.forEach(invite => {
            if (!users.includes(invite.sender_id.$id)) {
                users.push(invite.sender_id.$id);
            }
            if (!users.includes(invite.receiver_id.$id)) {
                users.push(invite.receiver_id.$id);
            }
        })

        attendants.documents.forEach(attendant => {
            if (!users.includes(attendant.user_id.$id)) {
                users.push(attendant.user_id.$id);
            }
        })

        return users;
    } catch (error) {
        console.error('Failed to retrieve users related to session:', error);
        throw error;
    }

}

export const inviteAll = async (sessionId) => {
    try {
        const active_session = await getActiveSession();
        const oldSessionAttendants = await getAllUsersRelatedToSession(sessionId);
        const activeSessionAttendants = await getAllUsersRelatedToSession(active_session.$id);

        for (const userId of oldSessionAttendants) {
            if (!activeSessionAttendants.includes(userId)) {
                const user = await getUser(userId);
                await addInvite(user);
            }
        }
        return;
    } catch (error) {
        console.error('Failed to get non-attending users:', error);
        throw error;
    }
}

export const CopySession = async (sessionId, name, place, time) => {
    try {
        const newSession = await addSession(name, time, place);

        await addUserSession(newSession);

        const user = await getCurrentUser();

        const sessionAttendants = await getAllUsersRelatedToSession(sessionId);
        for (const userId of sessionAttendants) {
            if (userId !== user.$id) {
                const user = await getUser(userId);
                await addInvite(user);
            }
        }
    } catch (error) {
        console.error('Failed to copy session:', error);
        throw error;
    }
}

export const getUserSessions = async (userId) => {
    try {

        const userSession = await databases.listDocuments(
            databaseId,
            userSessionId,
            [
                Query.equal('user_id', userId),
            ]
        );

        return userSession.documents;

    } catch (error) {
        console.error('Failed to retrieve user sessions:', error);
        alert(error);
    }
}


export const getUserSession = async (userId, sessionId) => {
    try {
        const userSession = await databases.listDocuments(
            databaseId,
            userSessionId,
            [
                Query.equal('user_id', userId),
                Query.equal('session_id', sessionId)
            ]
        );

        return userSession.documents[0];

    } catch (error) {
        alert(error);
    }
};


export const updateInvite = async (invite, status) => {
    try {

        await databases.updateDocument(
            databaseId,
            inviteCollectionId,
            invite.$id,
            {
                status: status,
            }
        );

    } catch (error) {
        alert(error);
    }
}

export const getPastSessionAttendants = async (activeSessionId) => {
    try{
        const attendants = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', activeSessionId)]
        )

        return attendants.documents;
    } catch (error) {
        alert(error);
    }
}