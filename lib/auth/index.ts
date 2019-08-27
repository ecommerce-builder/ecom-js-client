import EcomClient from '../index';
import firebase from '@firebase/app';
import '@firebase/auth';
import { EcomError } from '../db/error';
import { User } from '../db/types';

export interface AuthUser {
  displayName: string | null
  email: string | null
  emailVerified: boolean
  isAnonymous: boolean
  uid: string
}

export class Auth {
  readonly _client: EcomClient;
  private _authUser: AuthUser | null;
  private _user: User | null;

  constructor(client: EcomClient) {
    this._client = client;
    this._authUser = null;
    this._user = null
    // Initialize Firebase
    firebase.initializeApp(this._client.firebaseConfig);

    if (firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.dir(user);
        } else {
          // No user is signed in.
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
      let res = await this._client.post('/users', {
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
            this._client._token = await user.getIdToken();

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
