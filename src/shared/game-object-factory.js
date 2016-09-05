/**
 * EntityManager
 * @type {EntityManager}
 */
let EntityManager = require('./entity-manager')

/**
 * Class to generate Entities with the appropriate components
 * @class GameObjectFactory
 */
class GameObjectFactory {
  /**
   * Create a player entity
   * @static
   * @return {Entity} Player Entity
   */
  static createPlayer (id) {
    let entity = EntityManager.create(id)

    entity.inputs = []
    entity.position = {x: 0, y: 100}
    entity.position.previous = {x: 0, y: 100}
    entity.velocity = {x: 0, y: 0}
    entity.gravity = {x: 0, y: 2000}
    entity.input = {
      id: undefined,
      right: 39,
      left: 37,
      jump: 32
    }

    entity.sendSelf = function () {
      let components = {}

      components.id = this.id
      components.inputs = []
      components.position = this.position
      components.velocity = this.velocity
      components.gravity = this.gravity
      components.input = this.input
      components.other = {tint: '0xFF0000'}

      return components
    }

    entity.sendOther = function () {
      let components = {}

      components.id = this.id
      components.position = this.position

      // TODO: Change to actual sprite information
      components.other = {tint: '0x0000FF'}

      return components
    }

    entity.sendState = function () {
      let state = {}

      state.id = this.id
      state.processed = this.input.id
      state.position = this.position

      return state
    }

    return entity
  }

  static createEnemy () {
    let entity = EntityManager.create()

    entity.position = {x: 0, y: 100}
    entity.position.previous = {x: 0, y: 100}
    entity.velocity = {x: 50, y: 0}
    entity.gravity = {x: 0, y: 2000}

    entity.sendOther = function () {
      let components = {}

      components.id = this.id
      components.position = this.position

      components.other = {tint: '0x00FF00'}

      return components
    }

    entity.sendState = function () {
      let state = {}

      state.id = this.id
      state.position = this.position

      return state
    }

    return entity
  }
}

module.exports = GameObjectFactory
// module.exports = window.GameObjectFactory = GameObjectFactory
