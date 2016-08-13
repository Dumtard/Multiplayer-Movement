let Entity = require('./entity')
let EventEmitter = require('./event-emitter')

let id = 0

let handler = {
  set: function (entity, component, value) {
    let proxy = entity2proxy[entity.id]
    if (typeof value !== 'undefined') {
      entity[component] = value
      EventEmitter.emit('componentAdded', {entity: proxy, component})
    } else {
      EventEmitter.emit('componentRemoved', {entity: proxy, component})
      entity[component] = value
    }
    return true
  },

  deleteProperty: function (entity, component) {
    let proxy = entity2proxy[entity.id]
    EventEmitter.emit('componentRemoved', {proxy, component})
    return true
  }
}

let entities = []
let entity2proxy = {}

/**
 * Class to manage entities. All entities should be created and removed through
 * this interface. Will manage the list and give the appropriate entities to the
 * systems that use them.
 * @class EntityManager
 */
class EntityManager {
  /**
   * Create an entity with proxy wrapper to handle the adding and removing of
   * components.
   * @static
   * @return {Entity} Proxy to an entity
   */
  static createEntity () {
    let entity = new Proxy(new Entity(id++), handler)

    entity2proxy[entity.id] = entity
    entities.push(entity)

    return entity
  }

  /**
   * Get the list of entity proxies
   * @static
   * @return {Array<Entity>} List of entity proxies
   */
  static get entities () {
    return entities
  }

  /**
   * Remove the entity from the internal list. This will send the event to
   * remove from all the systems.
   * @static
   * @return {boolean} Success of the removal of the entity
   */
  static removeEntity (entity) {
    let proxy = entity2proxy[entity.id]

    let index = entities.indexOf(entity)

    if (index === -1) {
      return false
    }

    entities.splice(index, 1)
    delete entity2proxy[entity.id]
    EventEmitter.emit('entityRemoved', proxy)

    return true
  }
}

module.exports = EntityManager
// module.exports = window.EntityManager = EntityManager
