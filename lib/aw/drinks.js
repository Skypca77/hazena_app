/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import  { databases, cfg } from './client';
import { ID, Query } from 'react-native-appwrite';
import { getCurrentUser, getUserSession, updateUserSessionStats, getActiveSession } from './index';


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

export const getUserSessionDrinksWithoutQuery = async (userId, sessionId) => {
    try {
            const userSession = await getUserSession(userId, sessionId);
            const userSessionDrinks = await databases.listDocuments(
                databaseId,
                userDrinkSessionId,
                [
                    Query.equal('userSession', userSession.$id),
                ]
            );

            return userSessionDrinks.documents;
    } catch (error) {
        alert(error);
    }
}


export const getUserSessionOneDrink = async (userId, sessionId, drinkId) => {
    try {
        const userSession = await getUserSession(userId, sessionId);
        
        const userSessionOneDrink = await databases.listDocuments(
            databaseId,
            userDrinkSessionId,
            [
                Query.equal('userSession', userSession.$id),
                Query.equal('drink', drinkId)
            ]
        );

        return userSessionOneDrink.documents[0];

    } catch (error) {
        alert(error);
    }
}



export const plusUserDrinkSessionCount = async (userId, sessionId, drinkId) => {
    try{
        const userSession = await getUserSession(userId, sessionId);
        
        const userSessionDrink = await databases.listDocuments(
            databaseId,
            userDrinkSessionId,
            [
                Query.equal('userSession', userSession.$id),
                Query.equal('drink', drinkId)
            ]
        );

        if (userSessionDrink.documents.length > 0) {
            const drinkTimeTableDocument = await databases.createDocument(
                databaseId,
                drinkTimeTableCollectionId,
                ID.unique(),
                {
                    Drinked_time: new Date().toISOString(),
                }
            );

            const existingDrinkTimeTable = userSessionDrink.documents[0].drinkTimeTable || [];
            
            const updatedDrinkTimeTable = [...existingDrinkTimeTable, drinkTimeTableDocument.$id];

            await databases.updateDocument(
                databaseId,
                userDrinkSessionId,
                userSessionDrink.documents[0].$id,
                {
                    quantity: userSessionDrink.documents[0].quantity + 1,
                    drinkTimeTable: updatedDrinkTimeTable
                }
            );
        } else {
            alert("No matching drink document found for this user session.");
        }

        await updateUserSessionStats('active');
    } catch(e) {
        alert(e);
    }
}

export const minusUserDrinkSessionCount = async (userId, sessionId, drinkId) => {
    try{
        const userSession = await getUserSession(userId, sessionId);
        
        const userSessionDrink = await databases.listDocuments(
            databaseId,
            userDrinkSessionId,
            [
                Query.equal('userSession', userSession.$id),
                Query.equal('drink', drinkId)
            ]
        );

        if (userSessionDrink.documents.length > 0) {
            const drink = userSessionDrink.documents[0];
            const newQuantity = drink.quantity - 1;

            if (newQuantity < 0) {
                await databases.deleteDocument(
                    databaseId,
                    userDrinkSessionId,
                    drink.$id
                );
            } else {

                const updatedDrinkTimeTable = userSessionDrink.documents[0].drinkTimeTable || [];
                updatedDrinkTimeTable.pop();

                await databases.updateDocument(
                    databaseId,
                    userDrinkSessionId,
                    drink.$id,
                    {
                        quantity: newQuantity,
                        drinkTimeTable: updatedDrinkTimeTable
                    }
                );
            }
        } else {
            alert("No matching drink document found for this user session.");
        }

        await updateUserSessionStats('active');
    } catch(e) {
        alert(e);
    }
}


export const getNonAddedDrinks = async (query) => {
    try {
        const user = await getCurrentUser();
        const session = await getActiveSession();
        const userSession = await getUserSession(user.$id, session.$id);
        const AddedDrinks = await databases.listDocuments(
            databaseId,
            userDrinkSessionId,
            [
                Query.equal('userSession', userSession.$id)
            ]
        )

        const AddedDrinksIds = AddedDrinks.documents.map(drink => drink.drink.$id);

        const AllDrinks = await databases.listDocuments(
            databaseId,
            drinksCollectionId,
        )

        const NonAddedDrinks = AllDrinks.documents.filter(drink => {
            
            const isNotAdded = !AddedDrinksIds.includes(drink.$id);

            search = true;
            if (query != '') {
                search = drink.name.toLowerCase().includes(query.toLowerCase());
            }
            else {
                search = true;
            }

            return isNotAdded && search;
        });

        return NonAddedDrinks;
    } catch (error) {
        alert(error);
    }
}



export const addDrinkUserSession = async (drink) => {
    try {
        const user = await getCurrentUser();
        const session = await getActiveSession();
        const userSession = await getUserSession(user.$id, session.$id);
        await databases.createDocument(
            databaseId,
            userDrinkSessionId,
            ID.unique(),
            {
                quantity: 0,
                drink: drink.$id,
                userSession: userSession.$id,
                drinkTimeTable: null,
                drinkName: drink.name
            },
        )

    } catch (error) {
        alert(error);
    }
}

//author: Tomáš Skýpala, xskypa03
export const getUserDrinks = async (userId, sessionId) => {
    try {
        const userSessionDrinks = await getUserSessionDrinksWithoutQuery(userId, sessionId);
        const drinks = [];

        if (userSessionDrinks) {
            for (const drinkSession of userSessionDrinks) {
                if (drinkSession.drink && drinkSession.drink.$id) {
                    const drinkDetails = await databases.getDocument(
                        databaseId,
                        drinksCollectionId,
                        drinkSession.drink.$id
                    );

                    if (!drinkDetails || !drinkDetails.alcohol_ml) {
                        throw new Error('Failed to retrieve drink details');
                    }

                    for (const drinkTime of drinkSession.drinkTimeTable) {
                        const drink = {
                            drink_time: new Date(drinkTime.Drinked_time),
                            alcohol_ml: drinkDetails.alcohol_ml,
                            name: drinkDetails.name
                        };
                        drinks.push(drink);
                    }
                }
            }
        }
        drinks.sort((a, b) => a.drink_time - b.drink_time);

        return drinks;
    } catch (error) {
        console.error("getUserDrinks", error);
        // alert(error);
        alert("Failed to retrieve user drinks");
        return [];
    }
}


//author: Tomáš Skýpala, xskypa03
export async function calculateAlcoholDataMultipleDrinks({
    userid,
    sessionid,
    weight,
    gender,
    sessionStartTime
}) {
    const drinks = await getUserDrinks(userid, sessionid);
    const distributionRatio = gender === "male" ? 0.68 : 0.55; // Distribution factor
    const metabolismRate = 0.015; // BAC reduction rate per hour
    const absorptionTime = 0.5; // Time to reach peak BAC (in hours)
    const timeTable = [];
    const bacTable = [];
    let currentBAC = 0;
    let zeroBACTime = null;
    let bacChangedFromZero = false;
    let peakBAC = null;
    let bacStartedToDecrease = false;

    const endTime = new Date(); // End time is 1 hour from now
    if (sessionStartTime > endTime) {
        return { timeTable, datasets: [{ data: bacTable }], currentBAC: 'N/A‰', zeroBACTime: 'N/A', peakBAC: 'N/A', bacStartedToDecrease: 'N/A' };
    }

    // Iterate over each time point in 5-minute intervals
    for (let t = new Date(sessionStartTime); t <= endTime; t.setMinutes(t.getMinutes() + 5)) {
        let totalBAC = 0; // Total BAC at the current time as the sum of BAC from multiple drinks

        // Calculate the BAC contribution of each drink at time `t`
        for (const drink of drinks) {
            const drinkCreatedAt = new Date(drink.drink_time);
            if (isNaN(drinkCreatedAt.getTime())) {
                console.error('Invalid drink creation date:', drink.drink_time);
                continue;
            }

            const timeSinceDrink = (t - drinkCreatedAt) / (1000 * 60 * 60); // Time since the drink was consumed in hours

            if (timeSinceDrink >= 0) { // Only calculate if the time since the drink is non-negative
                const alcohol_ml = drink.alcohol_ml;
                const pureAlcohol = alcohol_ml * 0.789; // Convert milliliters of alcohol to grams
                const peakBACForDrink = pureAlcohol / (weight * distributionRatio);

                let currentBACForDrink;
                if (timeSinceDrink <= absorptionTime) {
                    // Absorption phase for this drink
                    currentBACForDrink = (peakBACForDrink * timeSinceDrink) / absorptionTime;
                } else {
                    // Metabolism phase after reaching peak BAC
                    currentBACForDrink = Math.max(peakBACForDrink - metabolismRate * (timeSinceDrink - absorptionTime), 0);
                }

                // Add the BAC contribution of this drink to the total BAC at time `t`
                totalBAC += currentBACForDrink;
            }
        }

        timeTable.push(new Date(t));
        bacTable.push(totalBAC);

        // Store the time and total BAC at this time point in the tables
        if (t <= new Date()) {
            currentBAC = totalBAC;
        }

        // Check if BAC has changed from zero
        if (totalBAC > 0) {
            bacChangedFromZero = true;
        }

        // Determine the time when BAC will reach 0‰
        if (bacChangedFromZero && totalBAC === 0 && !zeroBACTime && drinks.length > 0) {
            zeroBACTime = new Date(t).toISOString();
        }

        // Update peak BAC if the current total BAC is higher
        if (totalBAC > (peakBAC || 0)) {
            peakBAC = totalBAC;
        }

        // Check if BAC started to decrease
        if (!bacStartedToDecrease && totalBAC < (peakBAC || 0)) {
            bacStartedToDecrease = true;
        }
    }

    // If zeroBACTime is not set, estimate it based on the last BAC value
    if (!zeroBACTime && bacChangedFromZero && drinks.length > 0) {
        const lastBAC = bacTable[bacTable.length - 1];
        const lastTime = timeTable[timeTable.length - 1];
        if (lastTime && !isNaN(lastTime.getTime())) {
            const hoursToZeroBAC = lastBAC / metabolismRate;
            zeroBACTime = new Date(lastTime.getTime() + hoursToZeroBAC * 60 * 60 * 1000).toISOString();
        } else {
            zeroBACTime = 'N/A';
        }
    }

    return { timeTable, datasets: [{ data: bacTable }], currentBAC: `${currentBAC.toFixed(2)}‰`, zeroBACTime, peakBAC: bacStartedToDecrease ? `${peakBAC.toFixed(2)}‰` : null, bacStartedToDecrease, drinksData: drinks};
};