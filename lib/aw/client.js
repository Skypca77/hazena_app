// Serves as "global" definition file for other lib/aw/... files

import { Client, Account, Databases } from 'react-native-appwrite';

// Configuration object
export const cfg = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.itu.drinksteam",
    projectId: "671d347f000d6d56bcd6",
    databaseId: "671e354b0010532cfd83",
    userCollectionId: "671e35aa0003496d40ee",
    userSessionId: "672694550028e6ee2e0d",
    userDrinkSessionId: "6726902c001f64ef0ff2",
    inviteCollectionId: "672117a100191189153d",
    sessionCollectionId: "67211742000f65d90bf5",
    drinksCollectionId: "67268ee90038b663a9f9",
    friendsCollectionId: "67269596001c9779ad9c",
    drinkTimeTableCollectionId: "67312415001a4c828a26",
    storageId: "67269eec0006cd0fc1e5",
    drinkId: "67268ee90038b663a9f9",
};

// Prevents client from redefining
const client = new Client();
client.setEndpoint(cfg.endpoint).setProject(cfg.projectId);

// Define other variables as you wish (move from old appwrite.js)
// ...
export default client;

export const account = new Account(client);

export const databases = new Databases(client);
