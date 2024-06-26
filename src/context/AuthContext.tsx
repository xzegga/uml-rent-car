import React, { createContext, useContext, useEffect } from 'react'
import { auth } from '../utils/init-firebase'
import firebase, {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  confirmPasswordReset
} from 'firebase/auth'

import { ROLES, User } from '../models/Users';
import { useStore } from '../hooks/useGlobalStore';
import { initialGlobalState } from '../store/initialGlobalState';
import { getAllUsers, getOrSaveUserById, validateSession } from '../data/users';


type ContextState = {
  signInWithGoogle: () => Promise<firebase.UserCredential | undefined>,
  login: (...args: any[]) => Promise<firebase.UserCredential>,
  register: (...args: any[]) => Promise<firebase.UserCredential>,
  logout: (...args: any[]) => Promise<void>,
  forgotPassword: (...args: any[]) => Promise<void>,
  resetPassword: (...args: any[]) => Promise<void>,
  validate: (...args: any[]) => Promise<void>,
}

export const AuthContext = createContext<ContextState>({
} as ContextState)

export const useAuth = () => useContext(AuthContext)

export interface AuthContextProviderProps {
  children: React.ReactNode
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const { setState, currentUser } = useStore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      loginSuccess(usr);
    })
    return () => unsubscribe()
  }, [])

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const forgotPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${getBaseUrl()}login`,
    })
  }

  const getBaseUrl = (): string => {
    const currentUrl: string = window.location.href;
    let protocolIndex: number = currentUrl.indexOf("://");
    let startIndex: number;

    if (protocolIndex !== -1) {
      protocolIndex += 3; 
      startIndex = currentUrl.indexOf("/", protocolIndex);
      if (startIndex !== -1) {
        return currentUrl.substring(0, startIndex + 1);
      } else {
        return currentUrl + "/";
      }
    } else {
      return currentUrl;
    }
  }

  const resetPassword = (oobCode: string, newPassword: string) => {
    return confirmPasswordReset(auth, oobCode, newPassword)
  }

  const logout = () => {
    setState({ ...initialGlobalState })
    return signOut(auth)
  }

  const signInWithGoogle = async (): Promise<firebase.UserCredential | undefined> => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      return await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.log("Usuario o contraseña incorrectos", error);
    }

  }

  const getUsers = async (): Promise<User[]> => {
    let users: any[] = [];
    if (currentUser && currentUser.role === ROLES.Admin) {
        const response = await getAllUsers();
        users =  response.length ? response : [] as User[];
    }
    return users;
}

  const loginSuccess = async (usr: any) => {
    if (usr) {
      // Read claims from the user object

      const { claims } = await usr.getIdTokenResult();

      if (claims) {
        const user = {
          ...currentUser,
          name: usr.displayName,
          photoUrl: usr.photoURL,
          email: usr.email,
          uid: usr.uid,
          role: claims.role ? claims.role : ROLES.Client,
        } as User

        let users = [] as User[];
        if (claims.role === ROLES.Admin) {
          users = await getUsers();
        }
        const [ { data: savedUser } ] = await getOrSaveUserById(user);
        console.log('userSaved', savedUser);
        setState({
          currentUser: {
            ...savedUser,
            token: usr.accessToken,
          },
          users,
        });
      }
    }
  }

  const validate = async () => {
    const valid = await validateSession(currentUser.token);
    if (!valid) logout();
  }

  const value: ContextState = {
    signInWithGoogle,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    validate
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
