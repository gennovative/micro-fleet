import TrailsApp = require('trails');
import jwt = require('jsonwebtoken');
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { Types as cmT, IConfigurationProvider } from 'back-lib-common-contracts';
import { injectable, inject } from 'back-lib-common-util';

import { TrailsServerAddOn } from './TrailsServerAddOn';
import { Types as T } from './Types';
import bluebird = require('bluebird');


const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;

export type AuthResult = {
	payload: any,
	info: any,
	status: any
};

@injectable()
export class AuthAddOn implements IServiceAddOn {

	constructor(
		@inject(T.TRAILS_ADDON) private _serverAddOn: TrailsServerAddOn,
		@inject(cmT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
	) {
	}


	public get server(): TrailsApp {
		return this._serverAddOn.server;
	}


	//#region Init

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		this._serverAddOn.server['config'].web.middlewares.passportInit = passport.initialize();

		const opts = {
			algorithms: ['HS256'],
			secretOrKey: this._configProvider.get('jwtSecret'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			issuer: this._configProvider.get('jwtIssuer'),
		};
		this.initToken(opts);
		return Promise.resolve();
	}

	private initToken(opts): void {
		// `payload` is decrypted from Access token from header.
		let strategy = new JwtStrategy(opts, (payload, done) => {
			// TODO: 1. Validate payload object
			// Optional: Log timestamp for statistics purpose
			done(null, payload);
		});
		passport.use('jwt', strategy);
	}

	//#endregion Init

	public authenticate(request, response, next): Promise<AuthResult> {
		return new Promise<any>((resolve, reject) => {
			passport.authenticate('jwt', (error, payload, info, status) => {
				if (error) {
					return reject(error);
				}
				resolve({ payload, info, status });
			})(request, response, next);
		});
	}

	public async createToken(payload, isRefresh: Boolean): Promise<string> {
		let sign = new Promise<any>((resolve, reject) => {
			jwt.sign(
				// Data
				{
					accountId: payload.id,
					username: payload.username
				},
				// Secret
				this._configProvider.get('jwtSecret'),
				// Config
				{
					expiresIn: isRefresh ? '30d' : 60 * 30,
					issuer: this._configProvider.get('jwtIssuer'),
				},
				// Callback
				(err, token) => {
					if (token) {
						resolve(token);
					}
				});
		});
		let token = await sign;
		return token;
	}



	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return Promise.resolve();
	}
}