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

let server

class Client {
  constructor (gameServer) {
    server = gameServer

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

      // Create entity
      let entity = GameObjectFactory.createPlayer(socket.id)
      // Send first player entity
      let entities = []
      entities.push(entity.sendSelf())

      // Send all other players entities to first player
      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        if (entityIds[i] === socket.id) {
          continue
        }

        let entity = EntityManager.entities[entityIds[i]]
        entities.push(entity.sendOther())
      }
      socket.emit('createEntity', entities)

      socket.emit('tick', window.tick)

      // Send first player entity to all other players
      for (let i = 0, len = sockets.length; i < len; i++) {
        sockets[i].emit('createEntity', entity.sendOther())
      }

      // Remove the first player entity when they disconnect
      socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
        EntityManager.remove(socket.id)
        let index = sockets.indexOf(socket)

        sockets.splice(index, 1)

        for (let i = 0, len = sockets.length; i < len; i++) {
          sockets[i].emit('removeEntity', socket.id)
        }
      })
      // Latency check
      .on('tick', (data) => {
        socket.emit('tock', data.current)
      })
      // First player input, store it for later use
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

module.exports = Client
