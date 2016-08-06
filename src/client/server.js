let sockets = []

let io = require('socket.io-client')('http://localhost:9999')
window.io = io
sockets.push(io)

class Server {
  constructor () {
    io.on('connect', (socket) => {
      console.log('connected')
    })
  }

  send (event, data) {
    for (let i = 0, len = sockets.length; i < len; i++) {
      sockets[i].emit(event, data)
    }

    return this
  }

  get connected () {
    return io.connected
  }

  on (event, callback) {
    io.on(event, callback)

    return this
  }
}

module.exports = new Server()
