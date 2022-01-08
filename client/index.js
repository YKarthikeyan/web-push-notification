import { subscribe } from './push.js'
import { postToServer } from './util.js';


document.querySelector('#enableNotification').addEventListener('click', async () => {
    await subscribe();
    document.querySelector('#sendNotification').disabled = false;
})

document.querySelector('#sendNotification').addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer('/notify-me', { endpoint: subscription.endpoint });
    document.querySelector('#stopNotification').disabled = false;
})

document.querySelector('#stopNotification').addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer('/remove-subscription', {
        endpoint: subscription.endpoint
    });
    await subscription.unsubscribe();
    document.querySelector('#sendNotification').disabled = true;
    document.querySelector('#stopNotification').disabled = true;
})
