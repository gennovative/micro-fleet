"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const shortid = require("shortid");
const amqp = require("amqplib");
const _ = require("lodash");
const common_util_1 = require("@micro-fleet/common-util");
let TopicMessageBrokerConnector = TopicMessageBrokerConnector_1 = class TopicMessageBrokerConnector {
    constructor() {
        this._subscribedPatterns = [];
        this._emitter = new events_1.EventEmitter();
        this._queueBound = false;
        this._isConnected = false;
        this._isConnecting = false;
    }
    /**
     * @see IMessageBrokerConnector.queue
     */
    get queue() {
        return this._queue;
    }
    /**
     * @see IMessageBrokerConnector.queue
     */
    set queue(name) {
        if (this._queueBound) {
            throw new common_util_1.MinorException('Cannot change queue after binding!');
        }
        this._queue = name || `auto-gen-${shortid.generate()}`;
    }
    /**
     * @see IMessageBrokerConnector.messageExpiredIn
     */
    get messageExpiredIn() {
        return this._messageExpiredIn;
    }
    /**
     * @see IMessageBrokerConnector.messageExpiredIn
     */
    set messageExpiredIn(val) {
        if (this._queueBound) {
            throw new common_util_1.MinorException('Cannot change message expiration after queue has been bound!');
        }
        this._messageExpiredIn = (val >= 0) ? val : 0; // Unlimited
    }
    /**
     * @see IMessageBrokerConnector.subscribedPatterns
     */
    get subscribedPatterns() {
        return this._subscribedPatterns;
    }
    get isListening() {
        return this._consumerTag != null;
    }
    /**
     * @see IMessageBrokerConnector.connect
     */
    connect(options) {
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
        return this.createConnection(credentials, options);
    }
    /**
     * @see IMessageBrokerConnector.disconnect
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._connectionPrm || (!this._isConnected && !this._isConnecting)) {
                    return Promise.resolve();
                }
                let ch, promises = [];
                if (this._consumeChanPrm) {
                    ch = yield this._consumeChanPrm;
                    ch.removeAllListeners();
                    // Close consuming channel
                    promises.push(ch.close());
                }
                if (this._publishChanPrm) {
                    ch = yield this._publishChanPrm;
                    ch.removeAllListeners();
                    // Close publishing channel
                    promises.push(ch.close());
                }
                // Make sure all channels are closed before we close connection.
                // Otherwise we will have dangling channels until application shuts down.
                yield Promise.all(promises);
                if (this._connectionPrm) {
                    let conn = yield this._connectionPrm;
                    conn.removeAllListeners();
                    // Close connection, causing all temp queues to be deleted.
                    return conn.close();
                }
            }
            catch (err) {
                return this.handleError(err, 'Connection closing error');
            }
            finally {
                this._connectionPrm = null;
                this._publishChanPrm = null;
                this._consumeChanPrm = null;
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.deleteQueue
     */
    deleteQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnection();
            if (this.isListening) {
                throw new common_util_1.MinorException('Must stop listening before deleting queue');
            }
            try {
                let ch = yield this._consumeChanPrm;
                yield ch.deleteQueue(this.queue);
            }
            catch (err) {
                return this.handleError(err, 'Queue deleting failed');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.emptyQueue
     */
    emptyQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnection();
            try {
                let ch = yield this._consumeChanPrm, result = yield ch.purgeQueue(this.queue);
                return result.messageCount;
            }
            catch (err) {
                return this.handleError(err, 'Queue emptying failed');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.listen
     */
    listen(onMessage, noAck = true) {
        return __awaiter(this, void 0, void 0, function* () {
            common_util_1.Guard.assertArgFunction('onMessage', onMessage);
            this.assertConnection();
            try {
                let ch = yield this._consumeChanPrm;
                let conResult = yield ch.consume(this.queue, (msg) => {
                    let ack = () => ch.ack(msg), nack = () => ch.nack(msg);
                    onMessage(this.parseMessage(msg), ack, nack);
                }, { noAck });
                this._consumerTag = conResult.consumerTag;
            }
            catch (err) {
                return this.handleError(err, 'Error when start listening');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.stopListen
     */
    stopListen() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isListening) {
                return Promise.resolve();
            }
            this.assertConnection();
            try {
                let ch = yield this._consumeChanPrm;
                // onMessage callback will never be called again.
                yield ch.cancel(this._consumerTag);
                this._consumerTag = null;
            }
            catch (err) {
                return this.handleError(err, 'Error when stop listening');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.publish
     */
    publish(topic, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            common_util_1.Guard.assertArgNotEmpty('topic', topic);
            common_util_1.Guard.assertArgNotEmpty('message', payload);
            this.assertConnection();
            try {
                if (!this._publishChanPrm) {
                    // Create a new publishing channel if there is not already, and from now on we publish to this only channel.
                    this._publishChanPrm = this.createPublishChannel();
                }
                let ch = yield this._publishChanPrm, opt;
                let [msg, opts] = this.buildMessage(payload, options);
                // We publish to exchange, then the exchange will route to appropriate consuming queue.
                ch.publish(this._exchange, topic, msg, opts);
            }
            catch (err) {
                return this.handleError(err, 'Publishing error');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.subscribe
     */
    subscribe(matchingPattern) {
        return __awaiter(this, void 0, void 0, function* () {
            common_util_1.Guard.assertArgNotEmpty('matchingPattern', matchingPattern);
            this.assertConnection();
            try {
                let channelPromise = this._consumeChanPrm;
                if (!channelPromise) {
                    // Create a new consuming channel if there is not already, and from now on we listen to this only channel.
                    channelPromise = this._consumeChanPrm = this.createConsumeChannel();
                }
                // The consuming channel should bind to only one queue, but that queue can be routed with multiple keys.
                yield this.bindQueue(yield channelPromise, matchingPattern);
                this.moreSub(matchingPattern);
            }
            catch (err) {
                return this.handleError(err, 'Subscription error');
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.unsubscribe
     */
    unsubscribe(matchingPattern) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertConnection();
            try {
                if (!this._consumeChanPrm) {
                    return;
                }
                this.lessSub(matchingPattern);
                let ch = yield this._consumeChanPrm;
                yield ch.unbindQueue(this._queue, this._exchange, matchingPattern);
            }
            catch (err) {
                return this.handleError(err, `Failed to unsubscribe pattern "${matchingPattern}"`);
            }
        });
    }
    /**
     * @see IMessageBrokerConnector.unsubscribeAll
     */
    unsubscribeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this._subscribedPatterns.map(this.unsubscribe.bind(this)));
        });
    }
    /**
     * @see IMessageBrokerConnector.onError
     */
    onError(handler) {
        this._emitter.on('error', handler);
    }
    assertConnection() {
        common_util_1.Guard.assertIsDefined(this._connectionPrm, 'Connection to message broker is not established!');
        common_util_1.Guard.assertIsTruthy(this._isConnected || this._isConnecting, 'Connection to message broker is not established or has been disconnected!');
    }
    createConnection(credentials, options) {
        return this._connectionPrm = amqp.connect(`amqp://${credentials}${options.hostAddress}`)
            .then((conn) => {
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
    reconnect(credentials, options) {
        this._isConnecting = true;
        this._connectionPrm = new Promise((resolve, reject) => {
            setTimeout(() => {
                this.createConnection(credentials, options)
                    .then(resolve)
                    .catch(reject);
            }, options.reconnectDelay);
        });
        this.resetChannels();
    }
    resetChannels() {
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
    createConsumeChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createChannel()
                .then(ch => {
                ch.once('close', () => {
                    let oldCh = this._consumeChanPrm;
                    // Delay a little bit to see if underlying connection is still alive
                    setTimeout(() => {
                        // If connection has reset and already created new channels
                        if (this._consumeChanPrm !== oldCh) {
                            return;
                        }
                        this._consumeChanPrm = this.createConsumeChannel();
                    }, TopicMessageBrokerConnector_1.CHANNEL_RECREATE_DELAY);
                });
                return ch;
            });
        });
    }
    createPublishChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createChannel()
                .then(ch => {
                ch.once('close', () => {
                    let oldCh = this._publishChanPrm;
                    // Delay a little bit to see if underlying connection is still alive
                    setTimeout(() => {
                        // If connection has reset and already created new channels
                        if (this._publishChanPrm !== oldCh) {
                            return;
                        }
                        this._publishChanPrm = this.createPublishChannel();
                    }, TopicMessageBrokerConnector_1.CHANNEL_RECREATE_DELAY);
                });
                return ch;
            });
        });
    }
    createChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            const EXCHANGE_TYPE = 'topic';
            try {
                let conn = yield this._connectionPrm, ch = yield conn.createChannel();
                // Tell message broker to create an exchange with this name if there's not any already.
                // Setting exchange as "durable" means the exchange with same name will be re-created after the message broker restarts,
                // but all queues and waiting messages will be lost.
                yield ch.assertExchange(this._exchange, EXCHANGE_TYPE, { durable: true });
                ch.on('error', (err) => {
                    this._emitter.emit('error', err);
                });
                return ch;
            }
            catch (err) {
                return this.handleError(err, 'Channel creation error');
            }
        });
    }
    bindQueue(channel, matchingPattern) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let queue = this.queue, isTempQueue = (queue.indexOf('auto-gen') == 0);
                // Setting queue as "exclusive" to delete the temp queue when connection closes.
                yield channel.assertQueue(queue, {
                    exclusive: isTempQueue,
                    messageTtl: this.messageExpiredIn,
                    autoDelete: true
                });
                yield channel.bindQueue(queue, this._exchange, matchingPattern);
                this._queueBound = true;
            }
            catch (err) {
                return this.handleError(err, 'Queue binding error');
            }
        });
    }
    unbindQueue(channelPromise, matchingPattern) {
        return channelPromise.then(ch => ch.unbindQueue(this._queue, this._exchange, matchingPattern));
    }
    handleError(err, message) {
        if (err instanceof common_util_1.Exception) {
            // If this is already a wrapped exception.
            return Promise.reject(err);
        }
        return Promise.reject(new common_util_1.CriticalException(`${message}: ${err}`));
    }
    moreSub(pattern) {
        if (!this._subscribedPatterns.includes(pattern)) {
            this._subscribedPatterns.push(pattern);
        }
    }
    lessSub(pattern) {
        let pos = this._subscribedPatterns.indexOf(pattern);
        if (pos >= 0) {
            this._subscribedPatterns.splice(pos, 1);
        }
    }
    buildMessage(payload, options) {
        let msg;
        options = options || {};
        if (_.isString(payload)) {
            msg = payload;
            options.contentType = 'text/plain';
        }
        else {
            msg = JSON.stringify(payload);
            options.contentType = 'application/json';
        }
        return [Buffer.from(msg), options];
    }
    parseMessage(raw) {
        let msg = {
            raw,
            properties: raw.properties || {}
        };
        if (msg.properties.contentType == 'text/plain') {
            msg.data = raw.content.toString(msg.properties.contentEncoding);
        }
        else {
            msg.data = JSON.parse(raw.content);
        }
        return msg;
    }
};
TopicMessageBrokerConnector.CHANNEL_RECREATE_DELAY = 100; // Millisecs
TopicMessageBrokerConnector = TopicMessageBrokerConnector_1 = __decorate([
    common_util_1.injectable(),
    __metadata("design:paramtypes", [])
], TopicMessageBrokerConnector);
exports.TopicMessageBrokerConnector = TopicMessageBrokerConnector;
var TopicMessageBrokerConnector_1;

//# sourceMappingURL=MessageBrokerConnector.js.map
