import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/init-firebase';
import { LoggedUser } from '../store/initialGlobalState';
import { removeUndefinedProps } from '../utils/removeUndefined';
import { User } from '../models/Users';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const getAllUsers = async () => {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersCollection));

    const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
    }))
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


export const getOrSaveUserById = async (user: LoggedUser): Promise<any> => {
    try {
        const userCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(userCollection, where('uid', '==', user.uid)));

        if (querySnapshot.empty) {
            const docRef = await doc(collection(db, 'users'), user.uid);
            await setDoc(docRef, {
                ...removeUndefinedProps(user),
            });


            // await addDoc(userCollection, {
            //     ...removeUndefinedProps(user),
            //     role: ROLES.Unauthorized
            // }, user.uid as string);
        }

       return querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }))

    } catch (error) {
        console.log('Error getting user by ID:', error);
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
       return results.data
    }
};


export const validateSession = async (token: string): Promise<any> => {
    const functions = getFunctions();
    const validateToken = httpsCallable(functions, 'verifyToken');

    const results: any = await validateToken({
        token
    });

    return results.data.valid
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
        return message
    } catch (error: any) {
        return error;
    }
};
