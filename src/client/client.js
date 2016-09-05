let requestAnimationFrame = window.requestAnimationFrame
let PIXI = window.PIXI

let server = require('./server')

setInterval(() => {
  server.send('tick', {
    current: Date.now(),
    latency: latency
  })
}, 1000)

server.on('tock', (data) => {
  latency = Date.now() - data
})

let timer = {}
server.on('collision', (data) => {
  if (data) {
    let entity = EntityManager.entities[data]
    if (!entity) {
      return
    }
    entity.sprite.tint = 0xFFFFFF
    clearTimeout(timer[data])
    timer[data] = setTimeout(() => {
      entity.sprite.tint = entity.other.tint
    }, 100)
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

// TODO: Move this out of Client
/**
 * Renderer
 * @type {Renderer}
 */
let renderer = require('./renderer')

let latency = '---'
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
 * @class Client
 */
class Client {
  /**
   * Create a game instance
   * @constructor
   */
  constructor () {
    previousTime = Date.now() / 1000
    delta = 0
    updateDelta = 0
    sendDelta = 0

    window.tick = 0

    server.on('tick', (data) => {
      window.tick = data
    })

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
      window.tick++
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
