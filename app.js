require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const Sentry = require('@sentry/node');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(logger('dev'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use(Sentry.Handlers.errorHandler());

// 500 error handler
app.use((err, req, res, next) => {
    Sentry.captureException(err);
    console.error(err);
    res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

// 404 error handler
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `Are you lost? ${req.method} ${req.url} is not registered!`,
        data: null
    });
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('userRegistered', (user) => {
        console.log('New user registered:', user);
        socket.emit('welcomeNotification', 'Welcome! Your account has been created successfully.');
    });

    socket.on('passwordChanged', (user) => {
        console.log('Password changed for user:', user);
        socket.emit('passwordChangeNotification', 'Your password has been changed successfully.');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;