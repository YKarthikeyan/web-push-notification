const express = require('express')
const path = require('path');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const loki = require('lokijs');
const dotenv = require('dotenv');
const quotesJSON = require('./quotes.json');

const quotes = quotesJSON.quotes;
const db = new loki('notifications.db');
const users = db.addCollection('notifications');
const pushTimers = db.addCollection('timers');

dotenv.config();

const vapidDetails = {
    subject: process.env.VAPID_SUBJECT,
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

function sendNotifications(subscriptions) {
    const options = {
        TTL: 10000,
        vapidDetails: vapidDetails
    };
    subscriptions.forEach(async (subscription) => {
        const { endpoint, counter } = subscription;
        const id = endpoint.substr((endpoint.length - 8), endpoint.length);
        const notification = JSON.stringify({
            title: "Quotes for today",
            options: {
                body: quotes[counter].q
            }
        });
        const sub = users.findOne({ endpoint });
        sub.counter += 1;
        await users.update(sub);
        try {
            const result = await webpush.sendNotification(subscription, notification, options)
            console.log(`Endpoint ID: ${id}`);
            console.log(`Result: ${result.statusCode}`);
        } catch (error) {
            console.log(`Endpoint ID: ${id}`);
            console.log(`Error: ${error} `);
        }

    })
}


const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '/client')));
app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/client/index.html');
})

app.post('/add-subscription', (request, response) => {
    users.insert({ ...request.body, counter: 0 })
    response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
    const subscription = users.findOne(request.body);
    sendNotifications([subscription]);
    const timer = setInterval(() => { sendNotifications([subscription]); }, 5000)
    if (!pushTimers.findOne({ endpoint: subscription.endpoint })) {
        pushTimers.insert({ endpoint: subscription.endpoint, timerId: timer })
    }
    response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
    const { timerId } = pushTimers.findOne(request.body)
    clearInterval(timerId);
    pushTimers.findAndRemove(request.body)
    users.findAndRemove(request.body)
    response.sendStatus(200);
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
