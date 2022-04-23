const users = []

// AddUser, removeUser, getUser, getUserInRoom

//adduser
const addUser = ({id, username, room}) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error : "Username & rooms are required"
        }
    }

    //check the existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error : "User is in use!"
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return {user};
}

// addUser(12, 'Sambit', 'game')
// addUser(14, 'rajat', 'game')
// addUser(15, 'Mahesh', 'travel')
// addUser(16, 'Akshay', 'travel')

//remove user
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)  // Found the index of that user by user Id

    if(index !== -1){
        return users.splice(index,1)[0]        //removed that user from users array by its ID 
    }
}

// const removedUser = removeUser(12)
// console.log(removedUser)
// console.log(users)

// GetUser
const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}
// console.log(getUser(13))


// GetUsers in Room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()

    const isValidRoom = users.find((user) => user.room === room)

    if(!isValidRoom){
        return {
            error : "Room name is not valid"
        }
    }

    const usersInRoom = users.filter((user) => user.room === room)
    return usersInRoom
}

// console.log(getUsersInRoom('Travel'))


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}