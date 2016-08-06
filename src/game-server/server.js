// let InputSystem = require('./input-system')
// let GravitySystem = require('./gravity-system')
// let MoveSystem = require('./move-system')
// let WorldBoundsSystem = require('./world-bounds-system')

/**
 * EnttiyManager
 * @type {EntityManager}
 */
// let EntityManager = require('./entity-manager')

/**
 * GameObjectFactory
 * @type {GameObjectFactory}
 */
// let GameObjectFactory = require('./game-object-factory')

// window.player = GameObjectFactory.createPlayer()

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
let EntityManager = require('../client/entity-manager')

/**
 * GameObjectFactory
 * @type {GameObjectFactory}
 */
let GameObjectFactory = require('../client/game-object-factory')

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

    client.on('connect', (socket) => {
      GameObjectFactory.createPlayer()
    })

    client.on('disconnect', (socket) => {
      EntityManager.removeEntity(EntityManager.entities[0])
    })

    client.on('input', (data) => {
      let entity = EntityManager.entities[0]
      for (var i = 0; i < data.length; i++) {
        if (typeof entity.latest === 'undefined' ||
            data[i].id > entity.latest
        ) {
          entity.inputs.push(data[i])
          entity.latest = data[i].id
        }
      }
    })

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

      if (EntityManager.entities.length > 0) {
        let entity = EntityManager.entities[0]
        let input = EntityManager.entities[0].inputs.shift()

        if (input) {
          let keyboard = input.keyboard || {}
          let id = input.id

          if (keyboard[entity.input.right]) {
            entity.velocity.x = 100
          } else if (keyboard[entity.input.left]) {
            entity.velocity.x = -100
          } else {
            entity.velocity.x = 0
          }
          if (entity.velocity.y === 0 && keyboard[entity.input.jump]) {
            entity.velocity.y = -500
          }

          entity.velocity.y += entity.gravity.y * updateRate
          entity.velocity.x += entity.gravity.x * updateRate

          entity.position.x += entity.velocity.x * updateRate
          entity.position.y += entity.velocity.y * updateRate

          if (entity.position.y > 200) {
            entity.position.y = 200
            entity.velocity.y = 0
          }
          entity.input.id = id
          // console.log('update: ' + id)
          entity.dirty = true
        }
      }
      // InputSystem.update(updateRate)
      // GravitySystem.update(updateRate)
      // MoveSystem.update(updateRate)
      // WorldBoundsSystem.update(updateRate)
    }

    while (sendDelta >= sendRate) {
      sendDelta = sendDelta - sendRate

      if (EntityManager.entities.length > 0) {
        if (EntityManager.entities[0].dirty) {
          // console.log('send: ' + EntityManager.entities[0].input.id)
          client.send('state', [{
            id: EntityManager.entities[0].input.id,
            position: EntityManager.entities[0].position
          }])
          EntityManager.entities[0].dirty = false
        }
      }
    }
  }
}

module.exports = Server
