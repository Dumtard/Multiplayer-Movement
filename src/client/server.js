/**
 * EnttiyManager
 * @type {EntityManager}
 */
let EntityManager = require('../shared/entity-manager')

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
    io.emit(event, data)
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

let server = new Server()

server.on('state', (data) => {
  let tick = data.tick
  let entities = data.entities

  if (!entities.length > 0 || !entities[0]) {
    return
  }

  for (let i = 0, len = entities.length; i < len; i++) {
    let entity = EntityManager.entities[entities[i].id]

    if (!entity) {
      continue
    }

    if (entities[i].id === window.currentId) {
      if (typeof entity === 'undefined') {
        return
      }

      while (entity.inputs.length > 0 && entity.inputs[0].id <= entities[i].processed) {
        entity.inputs.shift()
      }

      if (entity.inputs.length === 0) {
        continue
      }

      var samePosition = entity.inputs[0].position.x === entities[i].position.x &&
        entity.inputs[0].position.y === entities[i].position.y

      if (!samePosition) {
        entity.position.x = entities[i].position.x
        entity.position.y = entities[i].position.y

        for (let i = 0; i < entity.inputs.length; i++) {
          // TODO: Move back to position
          // let input = entity.inputs[i]
        }
      }
    } else {
      // entity.position.previous.x = entity.position.x
      // entity.position.previous.y = entity.position.y
      // entity.position.x = entities[i].position.x
      // entity.position.y = entities[i].position.y

      entity.position.buffer = entity.position.buffer || []
      entity.tickDelta = entity.tickDelta || 0
      let position = {
        tick: tick,
        x: entities[i].position.x,
        y: entities[i].position.y,
      }
      entity.position.buffer.push(position)

      for (let j = 0, len2 = entity.position.buffer.length; j < len2; j++) {
        if (entity.position.buffer[j].tick > window.tick - 32) {
          entity.position.buffer.splice(0, j)
          break
        }
      }
    }
  }
})

window.currentId
server.on('createEntity', (data) => {
  if (data instanceof Array) {
    for (let i = 0, len = data.length; i < len; i++) {
      let entity = EntityManager.add(data[i])

      // TODO: Remove the need for this id
      if (!window.currentId) {
        window.currentId = entity.id
      }
    }
  } else {
    EntityManager.add(data)
  }
})

server.on('removeEntity', (data) => {
  EntityManager.remove(data)
})

server.on('disconnect', () => {
  console.log('disconnected')
  let keys = Object.keys(EntityManager.entities)
  for (let i = 0, len = keys.length; i < len; i++) {
    let id = keys[i]
    EntityManager.remove(id)
  }
})

module.exports = server
