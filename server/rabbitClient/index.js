var amqp = require('amqplib');
var EventEmitter = require('events');

var EXCHANGE_NAME = 'skyline';
var EXCHANGE_TYPE = 'topic';

function RabbitClient(options) {
    EventEmitter.call(this);
    this.options = options;
    this.channel = null;
    this.queueName = null;
    this.subscribedTopics = {};
}

RabbitClient.prototype = Object.create(EventEmitter.prototype);
RabbitClient.prototype.constructor = RabbitClient;

RabbitClient.prototype.connect = function() {
    var self = this;
    var host = this.options.host || 'localhost';
    var port = this.options.port || 5672;
    var url = 'amqp://' + host + ':' + port;

    amqp.connect(url)
        .then(function(conn) {
            return conn.createChannel();
        })
        .then(function(channel) {
            self.channel = channel;
            return channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });
        })
        .then(function() {
            return self.channel.assertQueue('', { exclusive: true });
        })
        .then(function(q) {
            self.queueName = q.queue;
            return self.channel.consume(self.queueName, function(msg) {
                if (msg) {
                    var topic = msg.fields.routingKey;
                    var message = msg.content.toString();
                    self.emit('message', topic, message);
                }
            }, { noAck: true });
        })
        .then(function() {
            self.emit('connect');
        })
        .catch(function(err) {
            console.error('RabbitMQ connection error:', err);
        });

    return this;
};

RabbitClient.prototype.publish = function(topic, message) {
    if (this.channel) {
        var content = Buffer.from(message != null ? String(message) : '');
        this.channel.publish(EXCHANGE_NAME, topic, content);
    }
};

RabbitClient.prototype.subscribe = function(topic) {
    if (this.channel && this.queueName && !this.subscribedTopics[topic]) {
        this.subscribedTopics[topic] = true;
        this.channel.bindQueue(this.queueName, EXCHANGE_NAME, topic);
    }
};

module.exports = {
    connect: function(options) {
        return new RabbitClient(options).connect();
    }
};
