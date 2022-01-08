import { urlBase64ToUint8Array } from './util.js';
import { postToServer } from "./util.js";

const PUBLIC_KEY = 'BMADYnRi39ontJ6KBD7JzD7Tvu2WWRfUFw3MebXMzd7mdCR_yFhz9GimReqRtnia4ldmbs40iWmN5vDFnEbrjeA';

const isServiceWorkerAvailable = () => 'serviceWorker' in navigator;
const isPushSupported = () => 'PushManager' in window;

const registerServiceWorker = async () => {
    if (!isServiceWorkerAvailable()) {
        alert('Oops! service worker not supported');
        return;
    };
    if (!isPushSupported()) {
        alert('Oops! Push API not supported');
        return;
    };
    try {
        const registration = await navigator.serviceWorker.register('./service-worker.js', {
            scope: '/',
        });
        console.log('Service worker successfully registered.');
        return registration;
    } catch (err) {
        console.error('Unable to register service worker.', err);

    }
}

const subscribeUserToPush = async (registration) => {
    const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
    };
    const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
    return pushSubscription;

}

const subscribe = async () => {
    try {
        const registration = await registerServiceWorker();
        const pushSubscription = await subscribeUserToPush(registration);
        await postToServer('/add-subscription', pushSubscription);
        return Promise.resolve();
    } catch {
        return Promise.reject();
    }


}
export { subscribe };
