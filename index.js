const express = require('express')
const path = require('path');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const loki = require('lokijs');
const dotenv = require('dotenv');

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
    const notification = JSON.stringify({
        title: "Hello!!!",
        options: {
            body: `ID: ${Math.floor(Math.random() * 100)}`
        }
    });

    const options = {
        TTL: 10000,
        vapidDetails: vapidDetails
    };

    subscriptions.forEach(async (subscription) => {
        const endpoint = subscription.endpoint;
        const id = endpoint.substr((endpoint.length - 8), endpoint.length);
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
    users.insert(request.body)
    response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
    const subscription = users.findOne(request.body);
    sendNotifications([subscription]);
    const timer = setInterval(() => { sendNotifications([subscription]); }, 5000)
    console.log(timer)
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