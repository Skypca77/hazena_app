import { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Query } from 'react-native-appwrite';
import { account, databases, cfg } from './client';

// Vytvoření kontextu
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('currentUser');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    const currentAccount = await account.get();
                    const currentUser = await databases.listDocuments(
                        cfg.databaseId,
                        cfg.userCollectionId,
                        [Query.equal('accountId', currentAccount.$id)]
                    );

                    if (currentUser.documents.length > 0) {
                        const userData = currentUser.documents[0];
                        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
                        setUser(userData);
                    }
                }
            } catch (error) {
                console.error('Chyba při načítání uživatele:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Vlastní hook pro přístup k uživateli
export const useAuth = () => useContext(AuthContext);

// sign_out is implemented in ./auth.js
