import EcomClient from '../index';
import firebase from '@firebase/app';
import '@firebase/auth';
import { EcomError } from '../db/error';
import { User } from '../db/types';
import { FirebaseOptions } from '@firebase/app-types';

export interface AuthUser {
  displayName: string | null
  email: string | null
  emailVerified: boolean
  isAnonymous: boolean
  uid: string
}

export class Auth {
  readonly _ecom: EcomClient;
  private _firebaseConfig: FirebaseOptions;
  private _authUser: AuthUser | null;
  private _user: User | null;

  constructor(ecom: EcomClient, firebaseConfig: FirebaseOptions) {
    this._ecom = ecom;
    this._firebaseConfig = firebaseConfig;
    this._authUser = null;
    this._user = null
    // Initialize Firebase
    firebase.initializeApp(this._firebaseConfig);

    if (firebase.auth) {
      firebase.auth().onIdTokenChanged(async (user) => {
        if (user) {
           // record the new token internally
          this._ecom._token = await user.getIdToken();
        }
      });


    }
  }

  get currentUser(): AuthUser | null {
    if (firebase.auth) {
      const fbCurrentUser = firebase.auth().currentUser;
      if (fbCurrentUser) {
        const authUser: AuthUser = {
          displayName: fbCurrentUser.displayName,
          email: fbCurrentUser.email,
          emailVerified: fbCurrentUser.emailVerified,
          isAnonymous: fbCurrentUser.isAnonymous,
          uid: fbCurrentUser.uid
        };
        return authUser;
      }
    }

    return null;
  }

  onAuthStateChanged(callback: any) {
    if (firebase.auth) {
      firebase.auth().onAuthStateChanged(callback);
    }
  }

  /**
   * Create a new customer
   * @param {string} email
   * @param {string} password
   * @param {string} firstname
   * @param {string} lastname
   * @returns {object|null}
   *
   */
  async createUser(email: string, password: string, firstname: string, lastname: string) : Promise<User | null> {
    try {
      let res = await this._ecom.post('/users', {
        email,
        password,
        firstname,
        lastname,
      });

      if (res.status >= 400) {
        let data = await res.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (res.status === 201) {
        let data = await res.json();
        this._user = {
          id: data.id,
          uid: data.uid,
          priceListID: data.price_list_id,
          role: data.role,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };
        return this._user;
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async signInAnonymously(): Promise<AuthUser> {
    if (!firebase.auth) {
      throw Error('firebase.auth not defined');
    }

    try {
      const userCredential = await firebase.auth().signInAnonymously();

      if (userCredential) {
        const user = userCredential.user;
        if (user) {
          this._ecom._token = await user.getIdToken();

          const authUser: AuthUser = {
            displayName: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            uid: user.uid,
          };
          this._authUser = authUser;
          return this._authUser;
        }
      }

      throw Error('failed to signin anonymously');
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param developerKey secret key
   */
  async signInWithDeveloperKey(developerKey: string): Promise<AuthUser> {
    try {
      let response = await this._ecom.post('/signin-with-devkey', {
        key: developerKey
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 201) {
        let data = await response.json();
        const token = data.custom_token;

        if (firebase.auth) {
          const userCredential = await firebase.auth().signInWithCustomToken(token);
          if (userCredential) {
            const user = userCredential.user;
            if (user) {
              this._ecom._token = await user.getIdToken();

              const authUser: AuthUser = {
                displayName: user.displayName,
                email: user.email,
                emailVerified: user.emailVerified,
                isAnonymous: user.isAnonymous,
                uid: user.uid,
              };
              this._authUser = authUser;
              return this._authUser;
            }
          }
        }
      }

      throw Error('failed to signin with developer key');
    } catch (err) {
      throw err;
    }
  }

  /**
   * Asynchronously signs in using an email and password.
   *
   * Fails with an error if the email address and password do not match.
   *
   * Error Codes
   *
   *     auth/invalid-email
   * Thrown if the email address is not valid.
   *
   *     auth/user-disabled
   * Thrown if the user corresponding to the given email has been disabled.
   *
   *     auth/user-not-found
   * Thrown if there is no user corresponding to the given email.
   *
   *     auth/wrong-password
   * Thrown if the password is invalid for the given email, or the account
   * corresponding to the email does not have a password set.
   * @param email
   * @param password
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    if (firebase.auth) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        if (userCredential) {
          const user = userCredential.user;
          if (user) {
            this._ecom._token = await user.getIdToken();

            const authUser: AuthUser = {
              displayName: user.displayName,
              email: user.email,
              emailVerified: user.emailVerified,
              isAnonymous: user.isAnonymous,
              uid: user.uid,
            };
            this._authUser = authUser;
            return this._authUser;
          }
        }
        throw Error('failed to signin');
      } catch (err) {
        throw err;
      }
    }
    throw Error('failed to signin');
  }

  async signOut(): Promise<void> {
    try {
      if (firebase.auth) {
        await firebase.auth().signOut();
      }
    } catch (err) {
      throw err;
    }
  }

  async onAuthStateChange(observer: (value: any) => void) {
    if (!firebase.auth) {
      throw new Error('failed to get firebase.auth');
    }

    firebase.auth().onAuthStateChanged(observer);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      if (firebase.auth) {
        return await firebase.auth().sendPasswordResetEmail(email)
      }
      throw Error(`failed to sendPasswordResetEmail for email=${email}`);
    } catch (err) {
      throw err;
    }
  }
}
