let System = require('../shared/system')

let keyboard = {}
let server = require('./server')

window.addEventListener('keydown', (event) => {
  keyboard[event.keyCode] = true
})

window.addEventListener('keyup', (event) => {
  keyboard[event.keyCode] = false
})

/**
 * Class for handling input on entities
 * @class GameObjectFactory
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
    if (entity.id !== window.currentId) {
      return
    }

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
    entity.input.id = (entity.input.id + 1) || 0
    entity.inputs.push({
      id: entity.input.id,
      tick: window.tick,
      keyboard: Object.assign({}, keyboard),
      position: Object.assign({}, entity.position)
    })
  }

  send () {
    for (let i = 0, len = this.entities.length; i < len; i++) {
      if (this.entities[i].id !== window.currentId) {
        return
      }
      server.send('input', this.entities[i].inputs)
    }
  }
}

module.exports = new InputSystem()
