const socketHelper = require('./socketHelper');

function emitEventToAll(eventName, eventData) {
    try {
        const io = socketHelper.getIo(); 
        io.emit(eventName, eventData);
    } catch (error) {
        console.log(error)
    }
}
exports.sendNotification = async (inAppNotification, notificationData)=> {
    try {
        emitEventToAll(inAppNotification, notificationData) 
    } catch (error) {
        console.log(error)
    }
}
