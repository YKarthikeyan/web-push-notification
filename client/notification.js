const isNotificationAPISupported = () => 'Notification' in window;
const isNotificationPermissionAllowed = () => Notification.permission === 'granted';
const askNotificationPermission = () => Notification.requestPermission();

const showNotification = async () => {
    if (!isNotificationAPISupported()) return;

    if (!isNotificationPermissionAllowed()) {
        await askNotificationPermission();
    }

    const notification = new Notification('Hi there!')
}

export { showNotification };