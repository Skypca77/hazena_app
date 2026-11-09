/************************/
/*  Name: Tomáš Skýpala */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { cfg, databases, account } from './client';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';
import { getCurrentUser  } from './index';


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



export const getAttendantsFromSession = async (session) => {
    try{

        const attendants = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', session.$id)]
        )

        return attendants.documents;

    } catch (error) {
        alert(error);
    }

}

export const sendRequest = async (userToRequestId) => {
    try {
        const user = await getCurrentUser();

        await databases.createDocument(
            databaseId,
            friendsCollectionId,
            ID.unique(),
            {
                sender_id: user.$id,
                receiver_id: userToRequestId,
                status: 'pending',
            },
        )


    } catch (error) {
        alert(error);
    }
}

export const uprateFriendRequest = async (userToRequestId, status) => {
    try {
        const user = await getCurrentUser();

        const friendRequest = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.or([
                    Query.and([
                        Query.equal('sender_id', user.$id),
                        Query.equal('receiver_id', userToRequestId)
                    ]),
                    Query.and([
                        Query.equal('sender_id', userToRequestId),
                        Query.equal('receiver_id', user.$id)
                    ])
                ])
            ]
        );

        if (friendRequest.documents.length > 0) {
            if (friendRequest.documents[0].status === 'declined' && status === 'pending') {
                if (user.$id === friendRequest.documents[0].sender_id?.$id) {
                    await databases.updateDocument(
                        databaseId,
                        friendsCollectionId,
                        friendRequest.documents[0].$id,
                        {
                            status: status,
                        }
                    );
                } else {
                    await databases.updateDocument(
                        databaseId,
                        friendsCollectionId,
                        friendRequest.documents[0].$id,
                        {
                            sender_id: user.$id,
                            status: status,
                            receiver_id: userToRequestId,
                        }
                    );
                }
                return;
            }
            await databases.updateDocument(
                databaseId,
                friendsCollectionId,
                friendRequest.documents[0].$id,
                {
                    status: status,
                }
            );
        } else {
            if (status === 'pending') {
                await sendRequest(userToRequestId);
                return;
            }
            console.error('No friend request found to unfriend.');
        }

    } catch (error) {
        console.error(error);
    }
}

export const getUserPoints = async (userId) => {
    try {
        // 1. Najdi všechny user sessions pro uživatele
        const userSessionsRes = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('user_id', userId)]
        );
        const userSessions = userSessionsRes.documents;

        if (!userSessions.length) return 0;

        // 2. Získej všechny userDrinkSession pro všechny tyto userSessions
        let allUserDrinkSessions = [];
        for (const session of userSessions) {
            const drinkSessionsRes = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [Query.equal('userSession', session.$id)]
            );
            allUserDrinkSessions = allUserDrinkSessions.concat(drinkSessionsRes.documents);
        }

        // 3. Sečti body podle quantity a typu drinku
        let totalPoints = 0;
        for (const drinkSession of allUserDrinkSessions) {
            // Pokud máš v drinkSession referenci na drink a ten má property "points"
            const drink = drinkSession.drink;
            const quantity = drinkSession.quantity || 0;
            const pointsPerDrink = drink?.points || 0;
            totalPoints += quantity * pointsPerDrink;
        }

        return totalPoints;
    } catch (error) {
        alert(error?.message || error);
        return 0;
    }
}