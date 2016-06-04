let requestAnimationFrame = window.requestAnimationFrame
let PIXI = window.PIXI

let InputSystem = require('./input-system')
let GravitySystem = require('./gravity-system')
let MoveSystem = require('./move-system')
let WorldBoundsSystem = require('./world-bounds-system')
let RenderSystem = require('./render-system')

/**
 * EnttiyManager
 * @type {EntityManager}
 */
let EntityManager = require('./entity-manager')

/**
 * GameObjectFactory
 * @type {GameObjectFactory}
 */
let GameObjectFactory = require('./game-object-factory')

window.player = GameObjectFactory.createPlayer()

/**
 * Renderer
 * @type {Renderer}
 */
let renderer = require('./renderer')

let previousTime = Date.now() / 1000
let delta = 0
let updateDelta = 0

let updateRate = 1 / 32

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
 * @class Game
 */
class Game {
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
    let currentTime = Date.now() / 1000
    delta = currentTime - previousTime
    previousTime = currentTime

    updateDelta = updateDelta + delta

    while (updateDelta >= updateRate) {
      updateDelta = updateDelta - updateRate

      InputSystem.update(updateRate)
      GravitySystem.update(updateRate)
      MoveSystem.update(updateRate)
      WorldBoundsSystem.update(updateRate)
    }

    RenderSystem.update(delta, updateDelta / updateRate)
    requestAnimationFrame(this.update.bind(this))
  }
}

module.exports = Game
