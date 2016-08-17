let requestAnimationFrame = window.requestAnimationFrame
let PIXI = window.PIXI

let server = require('./server')

let latency = '---'

setInterval(() => {
  server.send('test', Date.now())
}, 1000)

server.on('pong', (data) => {
  latency = Date.now() - data
})

window.currentId
server.on('createEntity', (data) => {
  let entity = EntityManager.addEntity(data)
  // TODO: Remove the need for this id
  if (!window.currentId) {
    window.currentId = entity.id
  }
})

server.on('removeEntity', (data) => {
  EntityManager.removeEntity(data)
})

server.on('disconnect', () => {
  console.log('disconnected')
  let keys = Object.keys(EntityManager.entities)
  for (let i = 0, len = keys.length; i < len; i++) {
    let id = keys[i]
    EntityManager.removeEntity(id)
  }
})

server.on('state', (data) => {
  if (!data.length > 0 || !data[0]) {
    return
  }

  for (let i = 0, len = data.length; i < len; i++) {
    let entity = EntityManager.entities[data[i].id]

    if (!entity) {
      continue
    }

    if (data[i].id === window.currentId) {
      if (typeof entity === 'undefined') {
        return
      }

      while (entity.inputs.length > 0 && entity.inputs[0].id <= data[i].processed) {
        entity.inputs.shift()
      }

      if (entity.inputs.length === 0) {
        continue;
      }

      var samePosition = entity.inputs[0].position.x === data[i].position.x &&
        entity.inputs[0].position.y === data[i].position.y

      if (!samePosition) {
        entity.position.x = data[i].position.x
        entity.position.y = data[i].position.y

        for (let i = 0; i < entity.inputs.length; i++) {
          // TODO: Move back to position
          // let input = entity.inputs[i]
        }
      }
    } else {
      entity.position.previous.x = data[i].position.x
      entity.position.previous.y = data[i].position.y
      entity.position.x = data[i].position.x
      entity.position.y = data[i].position.y
    }
  }
})

let InputSystem = require('./input-system')
let RenderSystem = require('./render-system')
let MoveSystem = require('../shared/move-system')
let GravitySystem = require('../shared/gravity-system')
let WorldBoundsSystem = require('../shared/world-bounds-system')

/**
 * EnttiyManager
 * @type {EntityManager}
 */
let EntityManager = require('../shared/entity-manager')

/**
 * GameObjectFactory
 * @type {GameObjectFactory}
 */
let GameObjectFactory = require('../shared/game-object-factory')

/**
 * Renderer
 * @type {Renderer}
 */
let renderer = require('./renderer')

let previousTime = Date.now() / 1000
let delta = 0
let updateDelta = 0
let sendDelta = 0

let updateRate = 1 / 32
let sendRate = 1 / 10

let debugText = new PIXI.Text(`Frame Time: --ms
      FPS: --.--
 Entities: ---
  Latency: ---`, { font: '16px Monospace', fill: 'white' })
debugText.x = 10
debugText.y = 10
debugText.visible = true

renderer.add(debugText)

document.addEventListener('keydown', (event) => {
  if (event.keyCode === 192) {
    debugText.visible = !debugText.visible
  }
})

/**
 * Base class for the game. This is the entry point to the game. It will manage
 * the game loop and calling all the appropriate systems
 * @class Client
 */
class Client {
  /**
   * Create a game instance
   * @constructor
   */
  constructor () {
    setInterval(() => {
      debugText.text = `Frame Time: ${(delta * 1000).toFixed(0)}ms
      FPS: ${(1 / delta).toFixed(2)}
 Entities: ${Object.keys(EntityManager.entities).length}
  Latency: ${latency}ms`
    }, 250)
  }

  /**
   * Start the game
   */
  start () {
    requestAnimationFrame(this.update.bind(this))
  }

  /**
   * The game loop, Update the game world. Will call all the systems at the
   * correct times.
   */
  update () {
    requestAnimationFrame(this.update.bind(this))

    let currentTime = Date.now() / 1000
    delta = currentTime - previousTime
    previousTime = currentTime

    if (!server.connected || document.hidden) {
      return
    }

    updateDelta = updateDelta + delta
    sendDelta = sendDelta + delta

    while (updateDelta >= updateRate) {
      updateDelta = updateDelta - updateRate

      GravitySystem.update(updateRate)
      MoveSystem.update(updateRate)
      WorldBoundsSystem.update(updateRate)

      InputSystem.update(updateRate)
    }

    while (sendDelta >= sendRate) {
      sendDelta = sendDelta - sendRate

      InputSystem.send()
    }

    RenderSystem.update(delta, updateDelta / updateRate)
  }
}

module.exports = Client
