let System = require('./system')

let keyboard = {}

window.addEventListener('keydown', (event) => {
  keyboard[event.keyCode] = true
})

window.addEventListener('keyup', (event) => {
  keyboard[event.keyCode] = false
})

/**
 * Class for handling input on entities
 * @class
 * @extends System
 */
class InputSystem extends System {
  /**
   * Create the Input System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['input'])
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to handle inputs for
   */
  handle (delta, entity) {
    entity.velocity.x = 0
    if (keyboard[entity.input.right]) {
      entity.velocity.x = 100
    } else if (keyboard[entity.input.left]) {
      entity.velocity.x = -100
    }
    if (entity.velocity.y === 0 && keyboard[entity.input.jump]) {
      entity.velocity.y = -500
    }
  }
}

module.exports = new InputSystem()
