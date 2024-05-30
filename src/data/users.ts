import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../utils/init-firebase';
import { removeUndefinedProps } from '../utils/removeUndefined';
import { Approver, User } from '../models/Users';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const getAllUsers = async () => {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersCollection));

    const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data()
    }));
    return result;
};

export const getUserDataById = async (id: string) => {
    const docRef = doc(collection(db, 'users'), id);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        data: docSnap.data() as User
    };
};

export const updateUserApproverById = async (id: string, approver: string) => {
    try {
        const docRef = doc(collection(db, 'users'), id);
        updateDoc(docRef, {
            approver
        });

        console.log('Approver updated successfully');
    } catch (error) {
        console.error('Error updating approver:', error);
    }
};

export const findUserByEmail = async (email: string): Promise<User> => {
    try {
        const userCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(userCollection, where('email', '==', email)));

        const users: any = [];
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users?.length ? users[0] : null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

export const getUserNamesById = async (id: string) => {
    const docRef = doc(collection(db, 'users'), id);
    const docSnap = await getDoc(docRef);

    const { uid, name, photoUrl } = docSnap.data() as User;
    return { uid, name, photoUrl };
};

export const getOrSaveUserById = async (user: User): Promise<any> => {
    try {
        const userCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(userCollection, where('uid', '==', user.uid)));

        if (querySnapshot.empty) {
            const docRef = await doc(collection(db, 'users'), user.uid);
            const { token, ...rest } = user;
            console.log(token);
            await setDoc(docRef, {
                ...removeUndefinedProps(rest)
            });
        }

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data()
        }));
    } catch (error) {
        console.log('Error getting user by ID:', error);
    }
};

export const saveUserById = async (user: User): Promise<any> => {
    try {
        // Save user to Firestore
        const docRef = doc(collection(db, 'users'), user.uid);
        await setDoc(docRef, {
            ...removeUndefinedProps(user)
        });
    } catch (error) {
        console.log('Error al guardar el usuario:', error);
    }
};

export const saveUser = async (token: string, user: any): Promise<any> => {
    const functions = getFunctions();
    const saveUserFuncion = httpsCallable(functions, 'saveUser');

    const results: any = await saveUserFuncion({
        token,
        user
    });

    if (results?.data) {
        return results.data;
    }
};

export const validateSession = async (token: string): Promise<any> => {
    const functions = getFunctions();
    const validateToken = httpsCallable(functions, 'verifyToken');

    const results: any = await validateToken({
        token
    });

    return results.data.valid;
};

export const removeUser = async (token: string, uid: string, id: string): Promise<any> => {
    const functions = getFunctions();
    const removeUserFuncion = httpsCallable(functions, 'removeUser');
    try {
        const message: any = await removeUserFuncion({
            token,
            uid,
            id
        });
        return message;
    } catch (error: any) {
        return error;
    }
};

export const addApprover = async (uid: string, approver: Approver) => {
    try {
        const userRef = await doc(collection(db, 'users'), uid);

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User does not exist!');
            } else {
                const approvals = userDoc.data()?.approvals ?? [];
                transaction.update(userRef, {
                    approvals: [...approvals, approver]
                });
            }
        });

        console.log('Approver added successfully');
    } catch (error) {
        console.error('Error adding approver:', error);
        throw error;
    }
};
