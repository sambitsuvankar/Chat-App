
const generateMessage = (username,text) => {
    return {
        username,
        text : text,
        createdAt : new Date().getTime()
    }
}

const generateLocationMessage = (username,location) => {
    return {
        username,
        url : `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}