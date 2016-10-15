let System = require('../shared/system')

/**
 * Renderer
 * @type {Renderer}
 */
let renderer = require('./renderer')

/**
 * Class for handling rendering of entities
 * @class RenderSystem
 * @extends System
 */
class RenderSystem extends System {
  /**
   * Create the Render System with the correct component requirements.
   * @constructor
   */
  constructor () {
    super(['position', 'sprite'])
  }

  /**
   * Handle entities being added to the system
   * @param {Entity} entity - The entity being added
   */
  add (entity) {
    super.add(entity)
    renderer.add(entity.sprite)
  }

  /**
   * Handle entities being removed from the system
   * @param {Number} index - The index of the entity being removed
   * @param {Entity} entity - The entity being removed
   */
  remove (entity) {
    super.remove(entity)
    renderer.remove(entity.sprite)
  }

  /**
   * Handle the system call
   * @param {Number} delta - The frame time
   * @param {Entity} entity - The entity to render
   */
  handle (delta, entity, [percent]) {
    let {position, sprite} = entity

    //TODO Refacto the shit out of this
    if (entity.position.buffer) {
      let start
      let end
      if (entity.position.buffer.length > 3 && !entity.currentTick) {
        start = entity.position.buffer[entity.position.buffer.length-3]
        end = entity.position.buffer[entity.position.buffer.length-2]
      } else if (entity.currentTick) {
        start = entity.currentTick
        for (let i = 0, len = entity.position.buffer.length; i < len; i++) {
          if (entity.position.buffer[i].tick === start.tick) {
            end = entity.position.buffer[i+1]
            break
          }
        }
      } else {
        return
      }

      if (!start || !end) {
        return
      }

      entity.currentTick = start

      entity.tickDelta += delta
      entity.currentTickRate = (end.tick - start.tick) * 0.03125

      if (entity.tickDelta > entity.currentTickRate) {
        start = entity.currentTick = end

        for (let i = 0, len = entity.position.buffer.length; i < len; i++) {
          if (entity.position.buffer[i].tick === start.tick) {
            end = entity.position.buffer[i+1]
            break
          }
        }

        entity.tickDelta -= entity.currentTickRate
      }

      let diff = {
        x: end.x - start.x,
        y: end.y - start.y
      }

      sprite.position.x = start.x + (diff.x * (entity.tickDelta / entity.currentTickRate))
      sprite.position.y = start.y + (diff.y * (entity.tickDelta / entity.currentTickRate))

      // console.log(window.tick + ': ' + sprite.position.x)
    } else {
      let diff = {
        x: position.x - position.previous.x,
        y: position.y - position.previous.y
      }

      sprite.position.x = position.previous.x + (diff.x * percent)
      sprite.position.y = position.previous.y + (diff.y * percent)
    }

  }

  /**
   * Handle the end of system call
   */
  end () {
    renderer.render()
  }
}

module.exports = window.system = new RenderSystem()
