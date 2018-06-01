import { EventEmitter } from 'events';

import * as shortid from 'shortid';
import * as amqp from 'amqplib';
import * as _ from 'lodash';

import { injectable, Exception, CriticalException, MinorException,
	Guard } from '@micro-fleet/common-util';


export type MessageHandleFunction = (msg: IMessage, ack?: () => void, nack?: () => void) => void;

export interface IMessage {
	data: any;
	raw: amqp.Message;
	properties?: IPublishOptions;
}

export interface IPublishOptions {
	contentType?: 'text/plain' | 'application/json';
	contentEncoding?: string;
	correlationId?: string;
	replyTo?: string;
}

export interface IConnectionOptions {
	/**
	 * IP address or host name where message broker is located.
	 */
	hostAddress: string;

	/**
	 * Username to login to message broker.
	 */
	username: string;

	/**
	 * Password to login to message broker.
	 */
	password: string;
	
	/**
	 * Exchange name
	 */
	exchange: string;

	/**
	 * Milliseconds to wait before trying to reconnect to message broker.
	 */
	reconnectDelay?: number;

	/**
	 * The default queue name to bind.
	 * If not specified or given falsey values (empty string, null,...), a queue with random name will be created.
	 * IMessageBrokerConnector's implementation may allow connecting to many queues.
	 * But each TopicMessageBrokerConnector instance connects to only one queue.
	 */
	queue?: string;

	/**
	 * Milliseconds to expire messages arriving in the queue.
	 */
	messageExpiredIn?: number;
}

export interface IMessageBrokerConnector {

	/**
	 * Gets or sets queue name.
	 * Queue can only be changed before it is bound.
	 * Queue is bound on the first call to `subscribe()` method.
	 * @throws Error if changing queue after it is bound.
	 */
	queue: string;

	/**
	 * Gets or sets milliseconds to expire messages arriving in the queue.
	 * Can only be changed before queue is bound.
	 * Queue is bound on the first call to `subscribe()` method.
	 * @throws Error if changing queue after it is bound.
	 */
	messageExpiredIn: number;

	/**
	 * Gets array of subscribed matching patterns.
	 */
	readonly subscribedPatterns: string[];

	/**
	 * Creates a connection to message broker engine.
	 * @param {IConnectionOptions} options
	 */
	connect(options: IConnectionOptions): Promise<void>;
	
	/**
	 * Closes all channels and the connection.
	 */
	disconnect(): Promise<void>;

	/**
	 * Deletes queue.
	 */
	deleteQueue(): Promise<void>;

	/**
	 * Deletes all messages in queue.
	 * Note that this won't remove messages that have been delivered but not yet acknowledged.
	 * They will remain, and may be requeued under some circumstances
	 * (e.g., if the channel to which they were delivered closes without acknowledging them).
	 * 
	 * @returns Number of deleted message.
	 */
	emptyQueue(): Promise<number>;

	/**
	 * Starts receiving messages.
	 * @param {function} onMessage - Callback to invoke when there is an incomming message.
	 * @param {boolean} noAck - If true, received message is acknowledged automatically.
	 * 	Default should be `true`.
	 */
	listen(onMessage: MessageHandleFunction, noAck?: boolean): Promise<void>;

	/**
	 * Stops receiving messages.
	 */
	stopListen(): Promise<void>;

	/**
	 * Sends `message` to the broker and label the message with `topic`.
	 * @param {string} topic - A name to label the message with. Should be in format "xxx.yyy.zzz".
	 * @param {any} payload - A message to send to broker.
	 * @param {IPublishOptions} options - Options to add to message properties.
	 */
	publish(topic: string, payload: any, options?: IPublishOptions): Promise<void>;

	/**
	 * Listens to messages whose label matches `matchingPattern`.
	 * @param {string} matchingPattern - Pattern to match with message label. Should be in format "xx.*" or "xx.#.#".
	 */
	subscribe(matchingPattern: string): Promise<void>;

	/**
	 * Stops listening to a topic pattern.
	 */
	unsubscribe(matchingPattern: string): Promise<void>;

	/**
	 * Stops listening to all subscriptions.
	 */
	unsubscribeAll(): Promise<void>;

	/**
	 * Registers a listener to handle errors.
	 */
	onError(handler: (err) => void): void;
}

@injectable()
export class TopicMessageBrokerConnector implements IMessageBrokerConnector {
	
	private static CHANNEL_RECREATE_DELAY = 100; // Millisecs

	private _connectionPrm: Promise<amqp.Connection>;
	
	// Each microservice has 2 channels, one for consuming and the other for publishing.
	private _publishChanPrm: Promise<amqp.Channel>;
	private _consumeChanPrm: Promise<amqp.Channel>;

	private _consumerTag: string;
	private _exchange: string;
	private _emitter: EventEmitter;
	private _isConnected: boolean;
	private _isConnecting: boolean;
	private _queue: string;
	private _queueBound: boolean;
	private _messageExpiredIn: number;
	private _subscribedPatterns: string[];

	constructor() {
		this._subscribedPatterns = [];
		this._emitter = new EventEmitter();
		this._queueBound = false;
		this._isConnected = false;
		this._isConnecting = false;
	}


	/**
	 * @see IMessageBrokerConnector.queue
	 */
	public get queue(): string {
		return this._queue;
	}

	/**
	 * @see IMessageBrokerConnector.queue
	 */
	public set queue(name: string) {
		if (this._queueBound) {
			throw new MinorException('Cannot change queue after binding!');
		}
		this._queue = name || `auto-gen-${shortid.generate()}`;
	}

	/**
	 * @see IMessageBrokerConnector.messageExpiredIn
	 */
	public get messageExpiredIn(): number {
		return this._messageExpiredIn;
	}

	/**
	 * @see IMessageBrokerConnector.messageExpiredIn
	 */
	public set messageExpiredIn(val: number) {
		if (this._queueBound) {
			throw new MinorException('Cannot change message expiration after queue has been bound!');
		}
		this._messageExpiredIn = (val >= 0) ? val : 0; // Unlimited
	}

	/**
	 * @see IMessageBrokerConnector.subscribedPatterns
	 */
	public get subscribedPatterns(): string[] {
		return this._subscribedPatterns;
	}


	private get isListening(): boolean {
		return this._consumerTag != null;
	}


	/**
	 * @see IMessageBrokerConnector.connect
	 */
	public connect(options: IConnectionOptions): Promise<void> {
		let credentials = '';
		
		this._exchange = options.exchange;
		this.queue = options.queue;
		this.messageExpiredIn = options.messageExpiredIn;
		this._isConnecting = true;

		options.reconnectDelay = (options.reconnectDelay >= 0) 
			? options.reconnectDelay
			: 3000; // 3s

		// Output:
		// - "usr@pass"
		// - "@pass"
		// - "usr@"
		// - ""
		if (!_.isEmpty(options.username) || !_.isEmpty(options.password)) {
			credentials = `${options.username || ''}:${options.password || ''}@`;
		}

		// URI format: amqp://usr:pass@10.1.2.3/vhost
		return <any>this.createConnection(credentials, options);
	}

	/**
	 * @see IMessageBrokerConnector.disconnect
	 */
	public async disconnect(): Promise<void> {
		try {
			if (!this._connectionPrm || (!this._isConnected && !this._isConnecting)) {
				return Promise.resolve();
			}

			let ch: amqp.Channel,
				promises = [];

			if (this._consumeChanPrm) {
				ch = await this._consumeChanPrm;
				ch.removeAllListeners();
				// Close consuming channel
				promises.push(ch.close());
			}

			if (this._publishChanPrm) {
				ch = await this._publishChanPrm;
				ch.removeAllListeners();
				// Close publishing channel
				promises.push(ch.close());
			}

			// Make sure all channels are closed before we close connection.
			// Otherwise we will have dangling channels until application shuts down.
			await Promise.all(promises);

			if (this._connectionPrm) {
				let conn: amqp.Connection = await this._connectionPrm;
				conn.removeAllListeners();
				// Close connection, causing all temp queues to be deleted.
				return conn.close();
			}

		} catch (err) {
			return this.handleError(err, 'Connection closing error');
		} finally {
			this._connectionPrm = null;
			this._publishChanPrm = null;
			this._consumeChanPrm = null;
		}
	}

	/**
	 * @see IMessageBrokerConnector.deleteQueue
	 */
	public async deleteQueue(): Promise<void> {
		this.assertConnection();
		if (this.isListening) {
			throw new MinorException('Must stop listening before deleting queue');
		}

		try {
			let ch = await this._consumeChanPrm;
			await ch.deleteQueue(this.queue);
		} catch (err) {
			return this.handleError(err, 'Queue deleting failed');
		}
	}

	/**
	 * @see IMessageBrokerConnector.emptyQueue
	 */
	public async emptyQueue(): Promise<number> {
		this.assertConnection();

		try {
			let ch = await this._consumeChanPrm,
				result = await ch.purgeQueue(this.queue);
			return result.messageCount;
		} catch (err) {
			return this.handleError(err, 'Queue emptying failed');
		}
	}

	/**
	 * @see IMessageBrokerConnector.listen
	 */
	public async listen(onMessage: MessageHandleFunction, noAck: boolean = true): Promise<void> {
		Guard.assertArgFunction('onMessage', onMessage);
		this.assertConnection();

		try {
			let ch = await this._consumeChanPrm;
			let conResult = await ch.consume(this.queue,
				(msg: amqp.Message) => {
					let ack = () => ch.ack(msg),
						nack = () => ch.nack(msg);

					onMessage(this.parseMessage(msg), ack, nack);
				}, 
				{ noAck }
			);
			this._consumerTag = conResult.consumerTag;
		} catch (err) {
			return this.handleError(err, 'Error when start listening');
		}
	}

	/**
	 * @see IMessageBrokerConnector.stopListen
	 */
	public async stopListen(): Promise<void> {
		if (!this.isListening) { return Promise.resolve(); }
		this.assertConnection();

		try {
			let ch = await this._consumeChanPrm;

			// onMessage callback will never be called again.
			await ch.cancel(this._consumerTag);
			this._consumerTag = null;
		} catch (err) {
			return this.handleError(err, 'Error when stop listening');
		}
	}

	/**
	 * @see IMessageBrokerConnector.publish
	 */
	public async publish(topic: string, payload: any, options?: IPublishOptions): Promise<void> {
		Guard.assertArgNotEmpty('topic', topic);
		Guard.assertArgNotEmpty('message', payload);
		this.assertConnection();
		try {
			if (!this._publishChanPrm) {
				// Create a new publishing channel if there is not already, and from now on we publish to this only channel.
				this._publishChanPrm = this.createPublishChannel();
			}
			let ch: amqp.Channel = await this._publishChanPrm,
				opt: amqp.Options.Publish;
			let [msg, opts] = this.buildMessage(payload, options);

			// We publish to exchange, then the exchange will route to appropriate consuming queue.
			ch.publish(this._exchange, topic, msg, opts);

		} catch (err) {
			return this.handleError(err, 'Publishing error');
		}
	}

	/**
	 * @see IMessageBrokerConnector.subscribe
	 */
	public async subscribe(matchingPattern: string): Promise<void> {
		Guard.assertArgNotEmpty('matchingPattern', matchingPattern);
		this.assertConnection();

		try {
			let channelPromise = this._consumeChanPrm;
			if (!channelPromise) {
				// Create a new consuming channel if there is not already, and from now on we listen to this only channel.
				channelPromise = this._consumeChanPrm = this.createConsumeChannel();
			}

			// The consuming channel should bind to only one queue, but that queue can be routed with multiple keys.
			await this.bindQueue(await channelPromise, matchingPattern);

			this.moreSub(matchingPattern);

		} catch (err) {
			return this.handleError(err, 'Subscription error');
		}
	}

	/**
	 * @see IMessageBrokerConnector.unsubscribe
	 */
	public async unsubscribe(matchingPattern: string): Promise<void> {
		this.assertConnection();
		try {
			if (!this._consumeChanPrm) { return; }
			
			this.lessSub(matchingPattern);
			let ch = await this._consumeChanPrm;
			await ch.unbindQueue(this._queue, this._exchange, matchingPattern);
		} catch (err) {
			return this.handleError(err, `Failed to unsubscribe pattern "${matchingPattern}"`);
		}
	}

	/**
	 * @see IMessageBrokerConnector.unsubscribeAll
	 */
	public async unsubscribeAll(): Promise<void> {
		return <any>Promise.all(
			this._subscribedPatterns.map(this.unsubscribe.bind(this))
		);
	}

	/**
	 * @see IMessageBrokerConnector.onError
	 */
	public onError(handler: (err) => void): void {
		this._emitter.on('error', handler);
	}


	private assertConnection(): void {
		Guard.assertIsDefined(this._connectionPrm,
			'Connection to message broker is not established!');
		Guard.assertIsTruthy(this._isConnected || this._isConnecting,
			'Connection to message broker is not established or has been disconnected!');
	}

	private createConnection(credentials: string, options: IConnectionOptions): Promise<amqp.Connection> {
		return this._connectionPrm = <any>amqp.connect(`amqp://${credentials}${options.hostAddress}`)
			.then((conn: amqp.Connection) => {
				this._isConnected = true;
				this._isConnecting = false;
				conn.on('error', (err) => {
					this._emitter.emit('error', err);
				})
				.on('close', () => {
					this._isConnected = false;
					this.reconnect(credentials, options);
				});
				return conn;
			})
			.catch(err => {
				return this.handleError(err, 'Connection creation error');
			});
	}

	private reconnect(credentials: string, options: IConnectionOptions): void {
		this._isConnecting = true;
		this._connectionPrm = new Promise<amqp.Connection>((resolve, reject) => {
			setTimeout(() => {
				this.createConnection(credentials, options)
					.then(resolve)
					.catch(reject);
			}, options.reconnectDelay);
		});
		this.resetChannels();
	}

	private resetChannels(): void {
		if (this._consumeChanPrm) {
			this._consumeChanPrm = this._consumeChanPrm
				.then(ch => ch.removeAllListeners())
				.then(() => {
					return this.createConsumeChannel();
				});
		}

		if (this._publishChanPrm) {
			this._publishChanPrm = this._publishChanPrm
				.then(ch => ch.removeAllListeners())
				.then(() => this.createPublishChannel());
		}
	}

	private async createConsumeChannel(): Promise<amqp.Channel> {
		return this.createChannel()
			.then(ch => {
				ch.once('close', () => {
					let oldCh = this._consumeChanPrm;

					// Delay a little bit to see if underlying connection is still alive
					setTimeout(() => {
						// If connection has reset and already created new channels
						if (this._consumeChanPrm !== oldCh) { return; }

						this._consumeChanPrm = this.createConsumeChannel();
					}, TopicMessageBrokerConnector.CHANNEL_RECREATE_DELAY);
				});
				return ch;
			});
	}

	private async createPublishChannel(): Promise<amqp.Channel> {
		return this.createChannel()
			.then(ch => {
				ch.once('close', () => {
					let oldCh = this._publishChanPrm;

					// Delay a little bit to see if underlying connection is still alive
					setTimeout(() => {
						
						// If connection has reset and already created new channels
						if (this._publishChanPrm !== oldCh) { return; }

						this._publishChanPrm = this.createPublishChannel();
					}, TopicMessageBrokerConnector.CHANNEL_RECREATE_DELAY);
				});
				return ch;
			});
	}

	private async createChannel(): Promise<amqp.Channel> {
		const EXCHANGE_TYPE = 'topic';

		try {
			let conn = await this._connectionPrm,
				ch = await conn.createChannel();

				// Tell message broker to create an exchange with this name if there's not any already.
				// Setting exchange as "durable" means the exchange with same name will be re-created after the message broker restarts,
				// but all queues and waiting messages will be lost.
			await ch.assertExchange(this._exchange, EXCHANGE_TYPE, {durable: true});

			ch.on('error', (err) => {
				this._emitter.emit('error', err);
			});
			return ch;

		} catch (err) {
			return this.handleError(err, 'Channel creation error');
		}
	}

	private async bindQueue(channel: amqp.Channel, matchingPattern: string): Promise<string> {
		try {
			let queue = this.queue,
				isTempQueue = (queue.indexOf('auto-gen') == 0);

			// Setting queue as "exclusive" to delete the temp queue when connection closes.
			await channel.assertQueue(queue, {
				exclusive: isTempQueue,
				messageTtl: this.messageExpiredIn,
				autoDelete: true
			});

			await channel.bindQueue(queue, this._exchange, matchingPattern);
			this._queueBound = true;

		} catch (err) {
			return this.handleError(err, 'Queue binding error');
		}
	}

	private unbindQueue(channelPromise: Promise<amqp.Channel>, matchingPattern: string): Promise<void> {
		return <any>channelPromise.then(
			ch => ch.unbindQueue(this._queue, this._exchange, matchingPattern)
		);
	}

	private handleError(err, message: string): Promise<never> {
		if (err instanceof Exception) {
			// If this is already a wrapped exception.
			return Promise.reject(err);
		}
		return Promise.reject(new CriticalException(`${message}: ${err}`));
	}
	
	private moreSub(pattern: string): void {
		if (!this._subscribedPatterns.includes(pattern)) {
			this._subscribedPatterns.push(pattern);
		}
	}

	private lessSub(pattern: string): void {
		let pos = this._subscribedPatterns.indexOf(pattern);
		if (pos >= 0) {
			this._subscribedPatterns.splice(pos, 1);
		}
	}

	private buildMessage(payload: string | Json | JsonArray, options?: IPublishOptions): Array<any> {
		let msg: string;
		options = options || {};

		if (_.isString(payload)) {
			msg = payload;
			options.contentType = 'text/plain';
		} else {
			msg = JSON.stringify(payload);
			options.contentType = 'application/json';
		}

		return [Buffer.from(msg), options];
	}

	private parseMessage(raw: amqp.Message): IMessage {
		let msg: Partial<IMessage> = {
			raw,
			properties: raw.properties || {}
		};

		if (msg.properties.contentType == 'text/plain') {
			msg.data = raw.content.toString(msg.properties.contentEncoding);
		} else {
			msg.data = JSON.parse(<any>raw.content);
		}

		return <IMessage>msg;
	}
}