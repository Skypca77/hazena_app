/************************/
/*  Name: Jan Skovajsa  */
/*  Login: xskova01     */
/*  Date: 12.14.2024    */
/************************/

import { databases, cfg } from './client';
import { Query, ID } from 'react-native-appwrite';
import { getCurrentUser, getUserSession } from './index';


// Can be copy-pasted, some will not be used
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


// functions for retreiving data from database

export const addSession = async (name, time, place) => {
    try {
        const session = await databases.createDocument(
            databaseId,
            sessionCollectionId,
            ID.unique(),
            {
                name: name,
                session_start: time,
                place: place,
            },
        )
        return session;

    } catch (error) {
        alert(error);
    }
}

// get session by its id
export const getSession = async (session_id) => {
    try {
        const session = await databases.getDocument(
            databaseId,
            sessionCollectionId,
            session_id
        );

        return session;
    } catch (error) {
        console.error('Failed to retrieve session:', error);
        throw error;
    }
}

// get userSession by its id
export const addUserSession = async (session) => {
    try {
        const user = await getCurrentUser();
        await databases.createDocument(
            databaseId,
            userSessionId,
            ID.unique(),
            {
                user_id: user,
                session_id: session,
                status: 'active',
                total_user_drink: 0,
                total_user_points: 0
            },
        )

    } catch (error) {
        alert(error);
    }
}

export const getUserSessionDrinks = async (userId, sessionId, query) => {
    try {
        const userSession = await getUserSession(userId, sessionId);
        if(userSession && query != ''){
            const userSessionDrinks = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [
                    Query.equal('userSession', userSession.$id),
                    Query.search('drinkName', query)
                ]
            );
    
            return userSessionDrinks.documents;
        }
        else if (userSession){
            const userSessionDrinks = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [
                    Query.equal('userSession', userSession.$id)
                ]
            );
    
            return userSessionDrinks.documents;
        }
    } catch (error) {
        alert(error);
    }
}

// Call after every drank drink to keep db stats synchronized
export const updateUserSessionStats = async (status) => {
    try {
        let user = await getCurrentUser();
        let session = await getActiveSession();
        if (!user || !session) {
            return;
        }

        const userSession = await getUserSession(user.$id, session.$id);
        if (!userSession) {
            return;
        }
        const userSessionDrinks = (await getUserSessionDrinks(user.$id, session.$id, '')) || [];

        let drinkCount = 0;
        let pointCount = 0;

        for(const drink of userSessionDrinks)
        {
            drinkCount += drink.quantity || 0;
            pointCount += (drink.quantity || 0) * (drink.drink?.alcohol_ml || 0);
        }
        

        await databases.updateDocument(
            databaseId,
            userSessionId,
            userSession.$id,
            {
                total_user_drink: drinkCount,
                total_user_points: pointCount,
                status: status,
            }
        );

    } catch (error) {
        alert(error);
    }
}

// get users belonging to active session
export const getSessionAttendants = async () => {
    try{
        const activeSession = await getActiveSession();
        if (!activeSession) {
            return [];
        }
        const attendants = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', activeSession.$id)]
        )

        return attendants.documents;
    } catch (error) {
        return [];
    }
}

// get active session
export const getActiveSession = async () => {
    try{
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return null;
        }
        const activeUserSession = await databases.listDocuments(
            databaseId,
            userSessionId,
            [
                Query.equal('user_id', currentUser.$id),
                Query.equal('status', 'active')
            ]
        );
        if (!activeUserSession || !activeUserSession.documents || activeUserSession.documents.length === 0) {
            return null;
        }
        if(activeUserSession.documents.length > 1){
            alert("Error: Database inconsistency");
            return null;
        }

        const session = activeUserSession.documents[0].session_id;
        return session;
    } catch (error) {
        alert(error);
        return null;
    }
}

// get invites for one session
export const getSessionInvitesForSession = async () => {
    try {
        const currentSession = await getActiveSession();
        if (!currentSession) {
            return [];
        }
        const sessionInvites = await databases.listDocuments(
            databaseId,
            inviteCollectionId,
            [
                Query.equal('session_id', currentSession.$id),
                Query.equal('status', 'pending'),
            ]
        );

        return sessionInvites.documents;

    } catch (error) {
        alert(error);
    }
}

// get all invites for one user
export const getSessionInvitesForUser = async (user) => {
    try {

        const invites = await databases.listDocuments(
            databaseId,
            inviteCollectionId,
            [
                Query.equal('receiver_id', user.$id),
                Query.equal('status', 'pending'),
            ]
        )

        return invites.documents;

    } catch (error) {
        alert(error);
    }
}

export const getUserSession_bySession = async (sessionId) => {
    try {
        const userSessionDrinks = await databases.listDocuments(
            databaseId,
            userSessionId,
            [Query.equal('session_id', sessionId)]
        );
        return userSessionDrinks.documents;
    } catch (error) {
        console.error('Failed to retrieve user session drinks:', error);
        throw error;
    }
}

// get all drinks, that have been drank in session for chart purpouses
export const getAllSessionDrinks = async (sessionId) => {
    try {
        const userSessions = await getUserSession_bySession(sessionId);
        if (userSessions.length === 0) {
            return [];
        }
        
        const drinkList = [];

        for (const userSession of userSessions) {
            const drinks = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [
                    Query.equal('userSession', userSession.$id),
                ]
            );

            for (const drink of drinks.documents) {
                for (const drinkRecord of drink.drinkTimeTable || []) {
                    const newDrink = {};

                    const drinkDate = new Date(drinkRecord.Drinked_time);
                
                    const hours = drinkDate.getHours().toString().padStart(2, '0');
                    const minutes = drinkDate.getMinutes().toString().padStart(2, '0');
                    
                    newDrink.drinkTime = `${hours}:${minutes}`;
                    newDrink.drinkName = drink.drinkName;
                    newDrink.timestamp = drinkDate.getTime();
                    newDrink.points = drink.drink?.alcohol_ml;
                    drinkList.push(newDrink);
                }
            }
        }

        // drinks of all users, in the order they were drunk
        return drinkList.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error('Failed to retrieve session drinks:', error);
        throw error;
    }
}

// get number of points of particular drink
export const getDrinkPoints = async (drinkName) => {
    try{

        const drinks = await databases.listDocuments(
            databaseId,
            drinkId,
            [
                Query.equal('name', drinkName),
            ]
        );

        return drinks.documents[0]?.alcohol_ml || 0;

    } catch (error) {
        alert(error);
        return 0;
    }

}

// get data for chart
export const getChartData = async (sessionId) => {
	try {
        const drinks = await getAllSessionDrinks(sessionId);
        const labels = [];
        const values = [];

        if (drinks.length > 0) {
            let counter = 0;

            for (const drink of drinks) {
                const drinkPoints = drink.points ?? await getDrinkPoints(drink.drinkName);
                counter += drinkPoints

                labels.push(drink.drinkTime);
                values.push(counter);

            }
        } 
        return {
            labels: labels,
            datasets: [
                {
                    data: values,
                },
            ],
        };
    } catch (error) {
		console.error('Error fetching chart data:', error);
		return {
            labels: [],
            datasets: [{ data: [] }],
          };
	}
}

// crete invite
export const addInvite = async (userToInvite) => {
    try {
        const user = await getCurrentUser();
        const activeSession = await getActiveSession();
        if (!user || !activeSession) {
            throw new Error('You are not in an active session');
        }

        await databases.createDocument(
            databaseId,
            inviteCollectionId,
            ID.unique(),
            {
                sender_id: user.$id,
                session_id: activeSession.$id,
                status: 'pending',
                receiver_id: userToInvite.$id,
                sent_time: new Date().toISOString()
            },
        )

    } catch (error) {
        alert(error);
    }
}

// delete invite
export const deleteInvite = async (invite) => {
    try {
        await databases.deleteDocument(
            databaseId,
            inviteCollectionId,
            invite.$id,
        )

    } catch (error) {
        alert(error);
    }
}







