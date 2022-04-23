const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())

const port = process.env.PORT

const publicDirectoryPath = path.join(__dirname, '../public')



// Right now there is two thing which is happening
// Server (emit) ---> Client(recieve)  ---> UpdateCount
// Client (emit) ---> Server (emit)    ---> Increment

io.on('connection', (socket) => {  // It runs some code when a user is connected

    

    //socket.broadcast.emit('message', generateMessage("A new User has joined..."))  // This will broadcast a message to all the clients except the current client.

    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id : socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)  // Socket.join() joints the client's chatrooms to the server
        
        socket.emit('message', generateMessage("Admin","Welcome to chat app"))
        // io.to.emit , socket.broadcast.to.emit

        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) // socket.broadcast.to(room).emit() This will broadcast a message to all the clients in a specific chatroom , except the current client

        io.to(user.room).emit('roomData', {  // This will emits all the users that are there in the chat room
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('sendMessage', (message, acknowledgedMessage)=> {  // The 2nd parameter in the callback function of socket.on() is the callback function that has been passed as a 3rd argument to socket.emit() which will be listened after the message got delivered to the server.
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
           return acknowledgedMessage("Bad words are not allowed")
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))  // io.to('game').emit() this will send the message to every client in this specific chat room mentioned in the to() . will not send the message outside the chatRoom
        acknowledgedMessage()
    })



    socket.on('location',(location, acknMesssage) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,location))

        acknMesssage("Location Shared!")
    })


    socket.on('disconnect', () => { // 'disconnect' event is the built in event of socketIo which will be called when a user disconnects or closes the tab in browser.
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))  // here we have sent every client the Same message. as the currect user has already left it won't recieve that message.

            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
})

// Note : When a new connection created the 1st thing the server does is its sends the current 'count' to that specific connection by using socket.emit('updateCount'). 
//If it had used io.emit() then it would have sent the current 'count' to every connections. That means every time a new client joins that would recieved the same data at the time of joining.

// The client recieves the event on chat.js file by socket.on('updateCount')

// Then we have emitted the 'Increment' event from the client by socket.emit('Increment')
// we recieved the event at server by socket.on('Increment')





app.use(express.static(publicDirectoryPath))

server.listen(port, () => {
    console.log("Listening to port ", port)
})