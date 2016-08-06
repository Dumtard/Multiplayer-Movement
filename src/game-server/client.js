let sockets = []

let io = require('socket.io')(9999)

let events = {}

class Client {
  constructor () {
    io.on('connect', (socket) => {
      console.log(`${socket.id} connected`)

      for (let event in events) {
        if (events.hasOwnProperty(event)) {
          socket.on(event, events[event])
          if (event === 'connect') {
            events[event](socket)
          }
        }
      }

      sockets.push(socket)
    })
  }

  get sockets () {
    return sockets
  }

  send (event, data) {
    for (let i = 0, len = sockets.length; i < len; i++) {
      sockets[i].emit(event, data)
    }

    return this
  }

  on (event, callback) {
    events[event] = callback
    for (let i = 0, len = sockets.length; i < len; i++) {
      sockets[i].on(event, callback)
    }

    return this
  }
}

module.exports = new Client()
