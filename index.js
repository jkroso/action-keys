
var Action = require('action')
  , $connect = Action.prototype.connect
  , keys = require('keycode').names

var modifiers = {
	ctrl: true,
	alt: true,
	shift: true,
	super: true
}

module.exports = function(){
	var act = new Action(dispatch)
	act.on = on
	act.hooks = {
		keyup: function(e){
			var key = keys[e.which]
			if (key in modifiers) {
				act[key] = undefined
			}
		},
		keydown: function(e){
			act.send(e, this)
		}
	}
	return act
	// act.connect = connect
}

function dispatch(e, subj){
	var key = keys[e.which]
	if (!key) return
	if (key in modifiers) {
		this[key] = true
		return
	}
	var pin = this.pins[key]
	if (!pin) return

	actions: for (var i = 0, len = pin.length; i < len; i++) {
		var act = pin[i]
		for (var mod in modifiers) {
			if (this[mod] !== act[mod]) continue actions
		}
		act.send(e, subj)
	}
}

function on(pin, action){
	if (typeof pin != 'string') {
		action = pin
		pin = pin.name
	}
	if (typeof action == 'function') action = new Action(action)
	var mods = pin.split(/ *\+ */)
	pin = mods.pop()
	if (mods.length) {
		action.hasModifiers = true
		mods.forEach(function(k){
			action[k] = true
		})
	}
	(this.pins[pin] || (this.pins[pin] = [])).push(action)
	return this
}

