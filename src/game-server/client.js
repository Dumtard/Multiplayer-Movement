let sockets = []

let io = require('socket.io')(9999)

let events = {}

/**
 * EntityManager
 * @type {EntityManager}
 */
let EntityManager = require('../shared/entity-manager')

/**
 * GameObjectFactory
 * @type {GameObjectFactory}
 */
let GameObjectFactory = require('../shared/game-object-factory')

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

      let entity = GameObjectFactory.createPlayer(socket.id)
      socket.emit('createEntity', entity)

      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        if (entityIds[i] === socket.id) {
          continue
        }

        let entity = EntityManager.entities[entityIds[i]]
        socket.emit('createEntity', entity)
      }

      for (let i = 0, len = sockets.length; i < len; i++) {
        sockets[i].emit('createEntity', entity)
      }

      socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
        EntityManager.removeEntity(socket.id)
        let index = sockets.indexOf(socket)

        sockets.splice(index, 1)

        for (let i = 0, len = sockets.length; i < len; i++) {
          sockets[i].emit('removeEntity', socket.id)
        }
      })
      .on('test', (data) => {
        socket.emit('pong', data)
      })
      .on('input', (data) => {
        let entity = EntityManager.entities[socket.id]
        for (var i = 0; i < data.length; i++) {
          if (typeof entity.latest === 'undefined' ||
              data[i].id > entity.latest
          ) {
            entity.inputs.push(data[i])
            entity.latest = data[i].id
          }
        }
      })

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

let client = new Client()

module.exports = client
