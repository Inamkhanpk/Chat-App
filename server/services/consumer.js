const { Kafka } = require('kafkajs');

// Create a Kafka client instance
const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: ['localhost:9092']  // Ensure this points to your Kafka broker
});

const consumer = kafka.consumer({ groupId: 'test-group' });

const consumeMessages = async () => {
    await consumer.connect();
    console.log('Consumer connected');

    // Subscribe to the topic
    await consumer.subscribe({ topic: 'demo-topic', fromBeginning: true });

    // Process incoming messages
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
        },
    });
};

consumeMessages();