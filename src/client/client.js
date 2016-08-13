let requestAnimationFrame = window.requestAnimationFrame
let PIXI = window.PIXI

let server = require('./server')

server.on('disconnect', () => {
  console.log('disconnected')
})

server.on('state', (data) => {
  if (!data.length > 0 || !data[0]) {
    return
  }
  let entity = EntityManager.entities[0]

  while (entity.inputs[0].id <= data[0].id) {
    entity.inputs.shift()
  }

  var samePosition = entity.inputs[0].position.x === data[0].position.x &&
    entity.inputs[0].position.y === data[0].position.y

  if (!samePosition) {
    console.log('WRONG POSITION')
    entity.position.x = data[0].position.x
    entity.position.y = data[0].position.y
  }

  // console.log(entity.inputs.length)
  // console.log(JSON.stringify(entity.inputs, undefined, 2))
  for (let i = 0; i < entity.inputs.length; i++) {
    // let input = entity.inputs[i]
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

window.player = GameObjectFactory.createPlayer()

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
 Entities: ---`, { font: '16px Monospace', fill: 'white' })
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
 Entities: ${EntityManager.entities.length}`
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

    // Receive

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
