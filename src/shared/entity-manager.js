let Entity = require('./entity')
let EventEmitter = require('./event-emitter')

let id = 0

let handler = {
  set: function (entity, component, value) {
    let proxy = entities[entity.id]
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
    let proxy = entities[entity.id]
    EventEmitter.emit('componentRemoved', {entity: proxy, component})
    return true
  }
}

let entities = {}

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
  static createEntity (id) {
    let entity = new Proxy(new Entity(id), handler)

    entities[entity.id] = entity

    return entity
  }

  /**
   * Add an existing entity to the list of entities
   */
  static addEntity (data) {
    let entity = new Proxy(new Entity(data.id), handler)

    entities[entity.id] = entity

    for (let key in data) {
      entity[key] = data[key]
    }

    if (typeof window !== 'undefined') {
      let sprite = PIXI.Sprite.fromImage('resources/square.png')
      sprite.tint = Math.random() * 0xFFFFFF
      sprite.scale.set(0.48, 0.64)

      entity.sprite = sprite
    }

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
    let id = entity
    if (entity instanceof Entity) {
      id = entity.id
    }

    entity = entities[id]

    delete entities[id]
    EventEmitter.emit('entityRemoved', entity)

    return true
  }
}

module.exports = EntityManager
if (typeof window !== 'undefined') {
  module.exports = window.EntityManager = EntityManager
}
