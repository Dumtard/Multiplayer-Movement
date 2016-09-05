// let InputSystem = require('./input-system')
let GravitySystem = require('../shared/gravity-system')
let MoveSystem = require('../shared/move-system')
let WorldBoundsSystem = require('../shared/world-bounds-system')

var Client = require('./client')
let client

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

// Private variables
let previousTime
let delta
let updateDelta
let sendDelta

const updateRate = 1 / 32
const sendRate = 1 / 10

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
  constructor () {
    previousTime = Date.now() / 1000
    delta = 0
    updateDelta = 0
    sendDelta = 0
    this.tick = 0

    client = new Client(this)
  }

  /**
   * Start the game
   */
  start () {
    console.log('Server Started')

    GameObjectFactory.createEnemy()

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
      this.tick++
      updateDelta = updateDelta - updateRate

      // TODO: Move this into a system
      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        let entity = EntityManager.entities[entityIds[i]]

        let input
        if (entity.inputs) {
          input = entity.inputs.shift()
        }

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

      for (let i = 0, len = entityIds.length; i < len; i++) {
        for (let j = 0, len = entityIds.length; j < len; j++) {
          let entity = EntityManager.entities[entityIds[i]]
          let entity2 = EntityManager.entities[entityIds[j]]

          if (entity.id !== entity2.id &&
              entity.position.x < entity2.position.x + 50 &&
              entity.position.x + 48 > entity2.position.x) {
            client.send('collision', entity.id)
          }
        }
      }

      GravitySystem.update(updateRate)
      MoveSystem.update(updateRate)
      WorldBoundsSystem.update(updateRate)
    }

    while (sendDelta >= sendRate) {
      sendDelta = sendDelta - sendRate

      let state = {
        tick: this.tick,
        entities: []
      }

      let entityIds = Object.keys(EntityManager.entities)
      for (let i = 0, len = entityIds.length; i < len; i++) {
        let entity = EntityManager.entities[entityIds[i]]
        // if (entity.dirty) {
        state.entities.push(entity.sendState())
        entity.dirty = false
        // }
      }
      client.send('state', state)
    }
  }
}

module.exports = Server
