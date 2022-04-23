const socket = io()


// socket.on('updateCount', (count) => {
    //     console.log("The count has been updated", count)
    // })
    
    // document.querySelector('#increment').addEventListener('click', () => {
        //     console.log("clicked")
        //     socket.emit('Increment')
        // })


// Elements..................

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    //newMessageStyle
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    // New Message element Height
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = messages.offsetHeight  // This is the height of our message container that we can see in our view port

    // Actual height of message container
    const containerHeight = messages.scrollHeight  // THis is the actual height of the message container from top to bottom after scrolling

    //How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}


socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})


socket.on('message', (string) => {
    console.log(string)

    const html = Mustache.render(messageTemplate, {
                                                    username : string.username,
                                                    message : string.text,
                                                    createdAt : moment(string.createdAt).format('h:mm a')
                                                })  // Here we are using "Mustache" library to render templates
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //Disable button
    messageFormButton.setAttribute('disabled', 'disabled')

    // const message = document.querySelector('input').value;
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (acknowledgedMessage) => {   
        //enable the Buton and reset the input field
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value =''

        if(acknowledgedMessage){
            return console.log(acknowledgedMessage)
        }
        console.log("This message was dlivered ")
    })
    // Note : the 3rd argument to the socket.emit() function is a callback function called as event acknowledgement.This callback function will be called after the server recieved the message from the client
})



locationButton.addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert("Your Browser does not support Geolocation")
    }
    //Disable send location button
    locationButton.setAttribute('disabled', 'disabled')

    let locationObj 

    navigator.geolocation.getCurrentPosition((position) => {
        locationObj = {latitude : position.coords.latitude, longitude : position.coords.longitude}
        // console.log(locationObj)

        socket.emit('location', locationObj, (acknMessage) => {
            locationButton.removeAttribute('disabled')
            console.log(acknMessage)
        })
    })

})

socket.on('locationMessage',(url)=> {
    console.log(url)

    const html = Mustache.render(locationTemplate, {username : url.username, location : url.url, createdAt : moment(url.createdAt).format('h:mm a')})
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})