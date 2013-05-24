
var Action = require('action').Action
  , $then = Action.prototype.then
  , keys = require('keycode').names
  , inherit = require('inherit')

var modifiers = {
	ctrl: true,
	alt: true,
	shift: true,
	super: true
}

module.exports = Dispatcher

/**
 * Dispatcher class
 */

function Dispatcher(){
	this.pins = {}
}

/**
 * inherit from Action
 */

inherit(Dispatcher, Action)

/**
 * update modifyer state
 * @param {Event} e
 */

Dispatcher.prototype.keyup = function(e){
	var key = keys[e.which]
	if (key in modifiers) this[key] = undefined
}

/**
 * dispatch an event
 * 
 * @param {Event} e
 * @param {Presenter} subj
 */

Dispatcher.prototype.keydown = function(e, subj){
	e.stopPropagation()
	var key = keys[e.which]
	if (!key) return
	if (key in modifiers) return this[key] = true
	var pin = this.pins[key]
	if (!pin) return

	actions: for (var i = 0, len = pin.length; i < len; i++) {
		var act = pin[i].action
		for (var mod in modifiers) {
			if (this[mod] !== act[mod]) continue actions
		}
		act.stdin(e, subj)
	}
}

/**
 * hook into the `.then()` so we can register modifyer keys
 * 
 * @param {String} pin
 * @param {Function|Action} action
 * @return {Action}
 */

Dispatcher.prototype.then = function(pin, action){
	if (typeof pin != 'string') action = pin, pin = pin.name
	var mods = pin.split(/ *\+ */)
	pin = mods.pop()
	action = $then.call(this, pin, action)
	if (mods.length) {
		action.hasModifiers = true
		mods.forEach(function(k){
			action[k] = true
		})
	}
	return action
}
