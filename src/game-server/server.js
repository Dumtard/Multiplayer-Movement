// let InputSystem = require('./input-system')
let GravitySystem = require('../shared/gravity-system')
let MoveSystem = require('../shared/move-system')
let WorldBoundsSystem = require('../shared/world-bounds-system')

let previousTime = Date.now() / 1000
let delta = 0
let updateDelta = 0
let sendDelta = 0

let updateRate = 1 / 32
let sendRate = 1 / 10

var client = require('./client')

/**
 * EntityManager
 * @type {EntityManager}
 */
let EntityManager = require('../shared/entity-manager')

/**
 * Base class for the game. This is the entry point to the game. It will manage
 * the game loop and calling all the appropriate systems
 * @class Server
 */
class Server {
  /**
   * Create a game instance
   * @constructor
   */
  // constructor () {
  // }

  /**
   * Start the game
   */
  start () {
    console.log('Server Started')

    setInterval(this.update.bind(this), 32)
  }

  /**
   * The game loop, Update the game world. Will call all the systems at the
   * correct times.
   */
  update () {
    let currentTime = Date.now() / 1000
    delta = currentTime - previousTime
    previousTime = currentTime

    updateDelta = updateDelta + delta
    sendDelta = sendDelta + delta

    while (updateDelta >= updateRate) {
      updateDelta = updateDelta - updateRate

      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        let entity = EntityManager.entities[entityIds[i]]
        let input = entity.inputs.shift()

        if (input) {
          let keyboard = input.keyboard || {}
          let id = input.id

          if (keyboard[entity.input.right] && keyboard[entity.input.left]) {
            entity.velocity.x = 0
          } else if (keyboard[entity.input.right]) {
            entity.velocity.x = 100
          } else if (keyboard[entity.input.left]) {
            entity.velocity.x = -100
          } else {
            entity.velocity.x = 0
          }
          if (entity.velocity.y === 0 && keyboard[entity.input.jump]) {
            entity.velocity.y = -500
          }

          entity.input.id = id
          entity.dirty = true
        }
      }
      GravitySystem.update(updateRate)
      MoveSystem.update(updateRate)
      WorldBoundsSystem.update(updateRate)
      // InputSystem.update(updateRate)
    }

    while (sendDelta >= sendRate) {
      sendDelta = sendDelta - sendRate

      let state = []

      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        let entity = EntityManager.entities[entityIds[i]]
        if (entity.dirty) {
          state.push({
              id: entity.id,
              processed: entity.input.id,
              position: entity.position
          })

          entity.dirty = false
        }
      }
      client.send('state', state)
    }
  }
}

module.exports = Server
