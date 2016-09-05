let Entity = require('./entity')
let EventEmitter = require('./event-emitter')

let PIXI
if (typeof window !== 'undefined') {
  PIXI = window.PIXI
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
   * @param {Number} id - The id of the entity
   * @return {Entity} entity - The entity that was added to the system
   */
  create (id) {
    let entity = new Proxy(new Entity(id), {
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
    })

    entities[entity.id] = entity

    return entity
  }

  /**
   * Add an existing entity to the list of entities
   * @param {Object} components - The components to create the entity out of
   * @return {Entity} entity - The entity that was added to the system
   */
  add (components) {
    let entity = this.create(components.id)

    for (let key in components) {
      entity[key] = components[key]
    }

    if (typeof window !== 'undefined') {
      let sprite = PIXI.Sprite.fromImage('resources/square.png')
      sprite.tint = entity.other.tint
      if (sprite.tint === '0x00FF00') {
        sprite.scale.set(0.5, 0.5)
      } else {
        sprite.scale.set(0.48, 0.64)
      }

      entity.sprite = sprite
    }

    entities[entity.id] = entity

    return entity
  }

  /**
   * Get the list of entity proxies
   * @return {Object} List of entity proxies
   */
  get entities () {
    return entities
  }

  /**
   * Remove the entity from the internal list. This will send the event to
   * remove from all the systems.
   * @return {boolean} Success of the removal of the entity
   */
  remove (entity) {
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

// module.exports = EntityManager
if (typeof window !== 'undefined') {
  module.exports = window.EntityManager = new EntityManager()
} else {
  module.exports = new EntityManager()
}
