let System = require('./system')

/**
 * Class for handling movement of entities
 * @class MoveSystem
 * @extends System
 */
class MoveSystem extends System {
  /**
   * Create the Move System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['position', 'velocity'])
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to move
   */
  handle (delta, entity) {
    entity.position.previous.x = entity.position.x
    entity.position.previous.y = entity.position.y
    entity.position.y += entity.velocity.y * delta
    entity.position.x += entity.velocity.x * delta

    entity.position.list = entity.position.list || []
    entity.position.list.push({tick: window.tick, x: entity.position.x, y: entity.position.y})

    if (entity.position.list.length > 20) {
      entity.position.list = entity.position.list.splice(entity.position.list.length-20, 20)
    }
  }
}

module.exports = new MoveSystem()
