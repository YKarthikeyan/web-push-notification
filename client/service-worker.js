self.addEventListener('push', (event) => {
    let notification = event.data.json();
    const options = {
        ...notification.options,
        icon: './images/notificationIcon.png',
        image: './images/notificationIcon.png',
        badge: './images/notificationIcon.png'
    }
    console.log(options)
    self.registration.showNotification(
        notification.title,
        options
    );
});
