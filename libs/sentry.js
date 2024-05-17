const Sentry = require("@sentry/node");
const { SENTRY_DSN, ENV } = process.env;
const express = require('express');

Sentry.init({
    environment: ENV,
    dsn: SENTRY_DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: express }),
    ],
    tracesSampleRate: 1.0,
});

module.exports = Sentry;