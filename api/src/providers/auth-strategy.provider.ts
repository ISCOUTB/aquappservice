import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';
import {BasicStrategy} from 'passport-http';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';

import {verify as verifyToken, sign as signToken} from 'jsonwebtoken';

export class AuthStrategyProvider implements Provider<Strategy | undefined> {
  /**
   * 
   * @param metadata Data provided by the authenticate decorator used
   * in the endpoints, per example:
   * @authenticate('BearerStrategy', {type: -1}),
   * @post('/water-bodies')
   * async newElement(@requestBody() body: WaterBody) {
   * ...
   * }
   * In this case, metadata is {type: -1, strategy: 'BearerStrategy'}, 
   * which indicates that the only user allowed to use the endpoint is the
   * admin user, and that the authentication method is token bearer.
   * 
   * @param usersRepo Users repository
   */
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(UserRepository) public usersRepo: UserRepository,
  ) {}

  value(): ValueOrPromise<Strategy | undefined> {
    // The function was not decorated, so we shouldn't attempt authentication
    if (!this.metadata) {
      return undefined;
    }

    const name = this.metadata.strategy;

    switch (name) {
      case 'BasicStrategy':
        return new BasicStrategy(
          (
            username: string,
            password: string,
            cb: (
              err: Error | null,
              user?:
                | {name: string; id: string | undefined; token: string}
                | false,
            ) => void,
          ) => this.verifyBasic(username, password, cb),
        );
      case 'BearerStrategy':
        return new BearerStrategy(
          (
            token: string,
            cb: (
              err: Error | null,
              user?: {name: string; id: string; token: string} | false,
            ) => void,
          ) => this.verifyBearer(token, cb),
        );
      default:
        return Promise.reject({
          message: `The strategy ${name} is not available.`,
          status: 400,
        });
    }
  }

  /**
   * Verify the user credentials. This follows the HTTP basic
   * authentication schema https://tools.ietf.org/html/rfc7617.
   * @param username Name of the user (KAMI for the admin)
   * @param password Password of the user
   * @param cb Callback function provided by passport-http,
   *  this is used to communicate to passport-http if
   *  the authentication process was successful or not. 
   */
  async verifyBasic(
    username: string,
    password: string,
    cb: (
      err: Error | null,
      user?:
        | {name: string; id: string | undefined; token: string; type: number}
        | false,
    ) => void,
  ) {
    // If user is KAMI, and the password is correct
    if (username === 'KAMI' && password === process.env.ADMIN_PASS) {
      cb(null, {
        id: '',
        name: 'KAMI',
        token: signToken(
          {name: 'KAMI', id: '', type: -1},
          process.env.SECRET_KEY || 'th349th',
        ),
        type: -1,
      });
      return;
    }
    // find user by name & password (For regular users, and enterprises)
    await this.usersRepo
      .find()
      .then(
        users => {
          const fusers = users.filter(
            u => u.name === username && u.password === password && u.enabled,
          );
          if (fusers.length === 0) {
            cb(null, false); // User not found
            return;
          }
          const user = fusers[0];

          cb(null, {
            id: user.id,
            name: user.name,
            token: signToken(
              {name: username, id: user.id, type: user.userType},
              process.env.SECRET_KEY || 'th349th',
            ),
            type: user.userType,
          }); // User found, successful login.
        },
        reason => {
          cb(reason, false);  // Failed login attempt
        },
      )
      .catch(reason => {
        cb(reason, false);  // Failed login attempt
      });
  }

  /**
   * Verify the user credentials. The authentication schema is
   * bearer token.
   * @param token Base64 encoded string
   * @param cb Callback function provided by passport-http,
   *  this is used to communicate to passport-http-bearer if
   *  the authentication process was successful or not. 
   */
  async verifyBearer(
    token: string,
    // tslint:disable-next-line:no-any
    cb: (err: Error | null, user?: any) => void,
  ) {
    try {
      /**
       * In case the authentication is successful, this payload
       * will be available to be injected in any controller via
       * AUTHENTICATION_BINDINGS.CURRENT_USER
       */
      // tslint:disable-next-line:no-any
      let payload: any = verifyToken(
        token,
        process.env.SECRET_KEY || 'th349th',
      );
      // tslint:disable-next-line:no-any
      const metadata: any = this.metadata.options || {type: -2};
      /**
       * If metadata.type is -2, then any user is fine. If it's -3, then all
       * admins are allowed to operate, but if it's any other value, it must
       * be the same as payload.type.
       */
      if (
        metadata.type === -2
          ? false
          : metadata.type === -3
          ? payload.type !== 0
          : payload.type !== metadata.type
      ) {
        throw new Error();
      }
      if (payload.name !== 'KAMI') {
        // Verify that the user is enabled.
        await this.usersRepo.findById(payload.id).then(
          user => {
            if (!user.enabled) {
              throw new Error();  // The user was disabled, so it's not allowed to log in
            }
          },
          () => {
            throw new Error();  // MongoDB error
          },
        );
      }
      cb(null, payload);
    } catch (err) {
      cb(err, false); // The token is malformed, invalid or the user contained lacks the privileges
    }
  }
}
