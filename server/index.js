const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const redisAdapter = require('socket.io-redis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// PostgreSQL pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Kafka client setup
const kafka = new Kafka({
    clientId: 'chat-app',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

async function setupKafka() {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'topic-test', fromBeginning: true });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const msg = JSON.parse(message.value.toString());
            io.to(msg.chatRoom).emit('message', msg);
        },
    });
}
setupKafka();

// Redis adapter for Socket.io
io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

// Socket.io events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (chatRoom) => {
        socket.join(chatRoom);
    });

    socket.on('send-message', async (data) => {
        // Produce message to Kafka
        await producer.send({
            topic: 'topic-test',
            messages: [{ value: JSON.stringify(data) }],
        });

        // Optionally store in PostgreSQL
        await pool.query(
            'INSERT INTO messages (userId, chatRoom, content) VALUES ($1, $2, $3)',
            [data.userId, data.chatRoom, data.content]
        );
    });

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

server.listen(4000, () => console.log('Backend running on port 4000'));