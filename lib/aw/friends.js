/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import  { databases, cfg } from './client';
import { ID, Query } from 'react-native-appwrite';
import { getCurrentUser, getSessionAttendants, getSessionInvitesForSession } from './index';

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

export const getFriends = async (query) => {
    try {
        const user = await getCurrentUser();
        const friends = new Set();

        const friendsBySender = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.equal('sender_id', user.$id),
                Query.or([
                    Query.equal('status', 'accepted'),
                    Query.equal('status', 'pending')
                ])
            ]
        );

        for (const friend of friendsBySender.documents) {
            friends.add(friend.receiver_id);
        }

        const friendsByReceiver = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.equal('receiver_id', user.$id),
                Query.or([
                    Query.equal('status', 'accepted'),
                    Query.equal('status', 'pending')
                ])
            ]
        );

        for (const friend of friendsByReceiver.documents) {
            friends.add(friend.sender_id);
        }

        const filteredFriends = Array.from(friends).filter(friend => {
            if (query) {
                return friend.username.toLowerCase().includes(query.toLowerCase());
            }
            return true;
        });

        return filteredFriends;

    } catch (error) {
        alert(error);
        return [];
    }
};

export const getInvitableFriends = async (query) => {
    try {
        const attendants = await getSessionAttendants();

        const invited = await getSessionInvitesForSession();

        const friends = await getFriends(query);

        let filteredFriends = [];
        if (friends && attendants) {
            filteredFriends = friends.filter(friend => {

                const isNotAttendant = !attendants.some(attendant => attendant.user_id.$id === friend.$id);

                const isNotInvited = !invited.some(invited => invited.receiver_id.$id === friend.$id);

                return isNotAttendant && isNotInvited;
            });
        }

        return filteredFriends;
    } catch (error) {
        alert(error);
        return [];
    }
};


export const getAllUsersWithoutFriends = async (query) => {
    try {
        const user = await getCurrentUser();
        const friends = await getFriends();

        const friendIDs = friends.map(friend => friend.$id);

        const allUsers = await databases.listDocuments(
            databaseId,
            userCollectionId,
        )

        const allUsersWithoutFriends = allUsers.documents.filter(usr => {
            const notFriend = !friendIDs.includes(usr.$id) && usr.$id !== user.$id;

            search = true;
            if (query.trim() !== '') {
                search = usr.username.toLowerCase().includes(query.toLowerCase());
            }

            return notFriend && search;
        });

        return allUsersWithoutFriends;
    } catch (error) {
        alert(error);
    }
}


export const getFriendRequestsForUser = async (userId) => {
    try {
        const friendRequests = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.equal('receiver_id', userId),
                Query.equal('status', 'pending')
            ]
        );
        return friendRequests.documents;
    } catch (error) {
        console.error('Failed to retrieve friend requests:', error);
        throw error;
    }
};

export const updateFriendRequest = async (requestId, status) => {
    try {
        const friendRequest = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.equal('$id', requestId),
                Query.equal('status', 'pending')
            ]
        );
        if (friendRequest.documents.length > 0) {
            await databases.updateDocument(
                databaseId,
                friendsCollectionId,
                friendRequest.documents[0].$id,
                { status }
            );
        } else {
            throw new Error('No pending friend request found with the given ID');
        }
    } catch (error) {
        console.error('Failed to update friend request:', error);
        throw error;
    }
}

export const isFriend = async (user1Id, user2Id) => {
    try {
        const friendRequest = await databases.listDocuments(
            databaseId,
            friendsCollectionId,
            [
                Query.or([
                    Query.and([
                        Query.equal('receiver_id', user1Id),
                        Query.equal('sender_id', user2Id)
                    ]),
                    Query.and([
                        Query.equal('receiver_id', user2Id),
                        Query.equal('sender_id', user1Id)
                    ])
                ])
            ]
        );
        if (friendRequest.documents.length === 0) {
            return { status:'not_friends', active_user_status: 'not_friends'};
        }

        const status = friendRequest.documents[0].status;
        const sender = friendRequest.documents[0].sender_id.$id;
        let active_user_status = 'not_friends';

        if (sender === user2Id) {
            active_user_status = 'sender';
        } else if (sender === user1Id) {
            active_user_status = 'receiver';
        }

        if (status === 'pending') {
            return { status: 'pending', active_user_status: active_user_status };
        } else if (status === 'accepted') {
            return { status:'accepted', active_user_status: active_user_status};
        } else if (status === 'declined') {
            return { status:'declined', active_user_status: active_user_status};
        }
        
    } catch (error) {
        console.error('Failed to check if user is a friend:', error);
        return 'error';
    }
}
