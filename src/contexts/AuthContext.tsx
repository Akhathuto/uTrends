import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, AuthContextType, ActivityLog, KeywordUsage, SavedContent, PlanName, UserRole } from '../types';
import { add, isAfter } from 'date-fns';
import { auth, db, googleProvider, githubProvider, signInWithPopup, collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, limit, OperationType, handleFirestoreError } from '../firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc as firestoreDoc, getDoc as getFirestoreDoc, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [savedContent, setSavedContent] = useState<SavedContent[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userRef = firestoreDoc(db, 'users', firebaseUser.uid);
                    const unsubscribeUser = onSnapshot(userRef, (doc) => {
                        if (doc.exists()) {
                            setUser(doc.data() as User);
                        } else {
                            const newUser: User = {
                                id: firebaseUser.uid,
                                name: firebaseUser.displayName || 'User',
                                email: firebaseUser.email || '',
                                plan: 'free',
                                role: 'user',
                                providerId: firebaseUser.providerData[0]?.providerId,
                                keywordUsage: { count: 0, resetDate: new Date().toISOString() }
                            };
                            setDoc(userRef, newUser);
                        }
                    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`));

                    // Activities listener
                    const activitiesQuery = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(50));
                    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
                        setActivities(snapshot.docs.map(doc => doc.data() as ActivityLog));
                    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activities'));

                    // SavedContent listener
                    const savedContentQuery = query(collection(db, `users/${firebaseUser.uid}/savedContent`), orderBy('createdAt', 'desc'), limit(100));
                    const unsubscribeSavedContent = onSnapshot(savedContentQuery, (snapshot) => {
                        setSavedContent(snapshot.docs.map(doc => doc.data() as SavedContent));
                    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${firebaseUser.uid}/savedContent`));

                    // Admin: Users listener
                    let unsubscribeUsers = () => {};
                    const checkAdmin = async () => {
                        const snap = await getFirestoreDoc(userRef);
                        if (snap.exists() && snap.data().role === 'admin') {
                            const usersQuery = query(collection(db, 'users'), limit(100));
                            unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
                                setUsers(snapshot.docs.map(doc => doc.data() as User));
                            }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
                        }
                    };
                    checkAdmin();

                    return () => {
                        unsubscribeUser();
                        unsubscribeActivities();
                        unsubscribeSavedContent();
                        unsubscribeUsers();
                    };
                } catch (error) {
                    console.error("Error setting up listeners:", error);
                }
            } else {
                setUser(null);
                setActivities([]);
                setSavedContent([]);
                setUsers([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logActivity = useCallback(async (action: string, icon: string) => {
        if (!user) return;

        const newActivity: ActivityLog = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            action,
            icon,
            timestamp: new Date().toISOString(),
        };

        try {
            await setDoc(firestoreDoc(db, 'activities', newActivity.id), newActivity);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'activities');
        }
    }, [user]);

    const getAllActivities = useCallback((): ActivityLog[] => {
        return activities;
    }, [activities]);

     const deleteUser = useCallback(async (userId: string) => {
        if (user?.id === userId) {
            throw new Error("Admins cannot delete their own account.");
        }
        // Implementation for admin to delete user would go here
    }, [user]);


    const login = async (email: string, pass: string): Promise<void> => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            throw new Error("Invalid email or password.");
        }
    };

    const loginWithGoogle = async (): Promise<void> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google login success:", result.user);
        } catch (error: any) {
            console.error("Google login error details:", {
                code: error.code,
                message: error.message,
                customData: error.customData,
                email: error.email,
                credential: error.credential
            });
            throw error;
        }
    };

    const loginWithGithub = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, githubProvider);
        } catch (error) {
            console.error("Github login error:", error);
            throw error;
        }
    };

    const signUp = async (name: string, email: string, pass: string, plan: PlanName): Promise<void> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const firebaseUser = userCredential.user;
            
            const newUser: User = {
                id: firebaseUser.uid,
                name,
                email,
                plan,
                role: 'user', // Default role
                providerId: 'password'
            };

            await setDoc(firestoreDoc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
        } catch (error) {
            throw new Error("Failed to create account. Email might already be in use.");
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            const { sendPasswordResetEmail } = await import('firebase/auth');
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new Error("Failed to send password reset email.");
        }
    };

    const upgradePlan = useCallback(async (plan: PlanName) => {
        if (user) {
            try {
                await setDoc(firestoreDoc(db, 'users', user.id), { plan }, { merge: true });
                setUser({ ...user, plan });
                logActivity(`upgraded to the ${plan} plan`, 'Star');
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
            }
        }
    }, [user, logActivity]);

    const getAllUsers = useCallback((): User[] => {
        return users;
    }, [users]);

    const updateUser = useCallback(async (userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => {
        try {
            await setDoc(firestoreDoc(db, 'users', userId), updates, { merge: true });
            if (user?.id === userId) {
                setUser({ ...user, ...updates });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        }
    }, [user]);

    const updateProfile = useCallback(async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'channels'>>): Promise<void> => {
        try {
            await setDoc(firestoreDoc(db, 'users', userId), updates, { merge: true });
            if (user?.id === userId) {
                setUser({ ...user, ...updates });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        }
    }, [user]);

    const getKeywordUsage = useCallback((): { remaining: number, limit: number | 'unlimited' } => {
        if (!user) return { remaining: 0, limit: 0 };

        const limits = {
            free: 3,
            starter: 15,
            pro: 'unlimited' as const
        };
        const limit = limits[user.plan];

        if (limit === 'unlimited') {
            return { remaining: Infinity, limit: 'unlimited' };
        }

        // Check if reset is needed
        const now = new Date();
        const resetDate = user.keywordUsage?.resetDate ? new Date(user.keywordUsage.resetDate) : new Date(0);
        
        // If it's a new day, we should reset (this logic is simplified, usually handled by a cloud function or on first load)
        const isNewDay = now.toDateString() !== resetDate.toDateString();
        
        const currentCount = isNewDay ? 0 : (user.keywordUsage?.count || 0);
        const remaining = Math.max(0, (limit as number) - currentCount);

        return { remaining, limit };
    }, [user]);

    const logKeywordAnalysis = useCallback(async () => {
        if (!user || user.plan === 'pro') return;
        
        const now = new Date();
        const resetDate = user.keywordUsage?.resetDate ? new Date(user.keywordUsage.resetDate) : new Date(0);
        const isNewDay = now.toDateString() !== resetDate.toDateString();
        
        const newCount = isNewDay ? 1 : (user.keywordUsage?.count || 0) + 1;
        
        try {
            await setDoc(firestoreDoc(db, 'users', user.id), {
                keywordUsage: {
                    count: newCount,
                    resetDate: now.toISOString()
                }
            }, { merge: true });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
        }
    }, [user]);

    const getSavedContent = useCallback((): SavedContent[] => {
        return savedContent;
    }, [savedContent]);

    const addSavedContent = useCallback(async (item: Omit<SavedContent, 'id' | 'userId' | 'createdAt'>) => {
        if (!user) return;

        const newItem: SavedContent = {
            ...item,
            id: Date.now().toString(),
            userId: user.id,
            createdAt: new Date().toISOString(),
        };

        try {
            await setDoc(firestoreDoc(db, `users/${user.id}/savedContent`, newItem.id), newItem);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${user.id}/savedContent`);
        }
    }, [user]);

    const deleteSavedContent = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await firestoreDeleteDoc(firestoreDoc(db, `users/${user.id}/savedContent`, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/savedContent/${id}`);
        }
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithGithub, signUp, logout, resetPassword, upgradePlan, getAllUsers, updateUser, updateProfile, logActivity, getAllActivities, deleteUser, getKeywordUsage, logKeywordAnalysis, getSavedContent, addSavedContent, deleteSavedContent }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
