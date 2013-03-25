!function (context, definition) {
	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		module.exports = definition()
	} else if (typeof define === 'function' && typeof define.amd  === 'object') {
		define(definition)
	} else {
		context['keydispatch'] = definition()
	}
}(this, function () {
	/**	
	 * Require the given path.	
	 *	
	 * @param {String} path   Full path to the required file	
	 * @param {String} parent The file which this call originated from	
	 * @return {Object} module.exports	
	 */	
		
	function require (path, parent){	
		// Determine the correct path	
		var fullpath = resolve(parent, path)	
		  , module = modules[fullpath]	
		
		if (module == null) throw Error('failed to require '+path+' from '+(parent || 'root'))	
		
		// It hasn't been loaded before	
		if (typeof module === 'string') {	
			var code = module	
			module = {	
				src: code,	
				exports: {}	
			}	
			modules[fullpath] = module	
			Function(	
				'module',	
				'exports',	
				'require',	
				// The source allows the browser to present this module as if it was a normal file	
				code+'\n//@ sourceURL='+encodeURI(fullpath)	
			).call(module.exports, module, module.exports,	
				// Relative require function	
				function (rp) {	
					if (rp[0] === '.') rp = join(dirname(fullpath), rp)	
					return require(rp, fullpath)	
				}	
			)	
		}	
		return module.exports	
	}	
		
	/**	
	 * Figure out what the full path to the module is	
	 *	
	 * @param {String} base, the current directory	
	 * @param {String} path, what was inside the call to require	
	 * @return {String}	
	 * @api private	
	 */	
		
	function resolve (base, path) {	
		if (path.match(/^\/|(?:[a-zA-Z]+:)/)) {	
			return modules[path] && path	
				|| modules[path+'.js'] && path+'.js'	
				|| modules[path+'.json'] && path+'.json'	
				|| modules[path+'index.js'] && path+'index.js'	
				|| modules[path+'/index.js'] && path+'/index.js'	
		}	
		
		while (true) {	
			var res = node_modules(base, path, modules)	
			if (res != null) return res	
			if (base === '/') break	
			base = dirname(base)	
		}	
	}	
		
	function dirname (path) {	
		if (path[path.length - 1] === '/') path = path.slice(0, -1)	
		return path.split('/').slice(0,-1).join('/') || '/'	
	}	
		
	function normalize (path) {	
		var isAbsolute = path[0] === '/'	
		  , res = []	
		path = path.split('/')	
		
		for (var i = 0, len = path.length; i < len; i++) {	
			var seg = path[i]	
			if (seg === '..') res.pop()	
			else if (seg && seg !== '.') res.push(seg)	
		}	
		
		return (isAbsolute ? '/' : '') + res.join('/')	
	}	
		
	function join () {	
		return normalize(slice(arguments).filter(function(p) {	
			return p	
		}).join('/'))	
	}	
		
	function slice (args) {	
		return Array.prototype.slice.call(args)	
	}	
	
	function node_modules (dir, name, hash) {
		var match = variants(dir, name).filter(function (p) {
			return p in hash
		})
	
		if (match.length) {
			if (match.length > 1) console.warn('%s -> %s has several matches', dir, name)
			return match[0]
		}
	
		// core modules
		if (dir === '/' && hash['/node_modules/'+name+'.js']) {
			return '/node_modules/'+name+'.js'
		}
	}
	
	function variants(dir, path) {
		// Is it a full path already
		if (path.match(/\.js(?:on)?$/)) {
			path = [path]
		}
		// A directory
		else if (path.match(/\/$/)) {
			path = [
				path+'index.js',
				path+'index.json',
				path+'package.json'
			]
		}
		// could be a directory or a file
		else {
			path = [
				path+'.js',
				path+'.json',
				path+'/index.js',
				path+'/index.json',
				path+'/package.json'
			]
		}
	
		return path.map(function (name) {
			return join(dir, 'node_modules', name)
		})
	}
	var modules = {
		"/index.js": "\nvar Action = require('action')\n  , $connect = Action.prototype.connect\n  , keys = require('keycode').names\n\nvar modifiers = {\n\tctrl: true,\n\talt: true,\n\tshift: true,\n\tsuper: true\n}\n\nmodule.exports = function(){\n\tvar act = new Action(dispatch)\n\tact.on = on\n\tact.hooks = {\n\t\tkeyup: function(e){\n\t\t\tvar key = keys[e.which]\n\t\t\tif (key in modifiers) {\n\t\t\t\tact[key] = undefined\n\t\t\t}\n\t\t},\n\t\tkeydown: function(e){\n\t\t\tact.send(e, this)\n\t\t}\n\t}\n\treturn act\n\t// act.connect = connect\n}\n\nfunction dispatch(e, subj){\n\tvar key = keys[e.which]\n\tif (!key) return\n\tif (key in modifiers) {\n\t\tthis[key] = true\n\t\treturn\n\t}\n\tvar pin = this.pins[key]\n\tif (!pin) return\n\n\tactions: for (var i = 0, len = pin.length; i < len; i++) {\n\t\tvar act = pin[i]\n\t\tfor (var mod in modifiers) {\n\t\t\tif (this[mod] !== act[mod]) continue actions\n\t\t}\n\t\tact.send(e, subj)\n\t}\n}\n\nfunction on(pin, action){\n\tif (typeof pin == 'function') {\n\t\taction = pin\n\t\tpin = pin.name\n\t}\n\tvar mods = pin.split(/ *\\+ */)\n\tpin = mods.pop()\n\tif (typeof action == 'function') action = new Action(action)\n\tif (mods.length) {\n\t\taction.hasModifiers = true\n\t\tmods.forEach(function(k){\n\t\t\taction[k] = true\n\t\t})\n\t}\n\t(this.pins[pin] || (this.pins[pin] = [])).push(action)\n\treturn this\n}\n\n",
		"/node_modules/action/index.js": "module.exports = require('./src')",
		"/node_modules/keycode/index.js": "/**\n * Conenience method returns corresponding value for given keyName or keyCode.\n *\n * @param {Mixed} keyCode {Number} or keyName {String}\n * @return {Mixed}\n * @api public\n */\n\nexports = module.exports = function (k) {\n  if (typeof k === 'string') return codes[k.toLowerCase()]\n  return names[k]\n}\n\n/**\n * Get by name\n *\n *   exports.code['Enter'] // => 13\n */\n\nvar codes = exports.codes = {\n  'backspace': 8,\n  'tab': 9,\n  'enter': 13,\n  'shift': 16,\n  'ctrl': 17,\n  'alt': 18,\n  'pause/break': 19,\n  'caps lock': 20,\n  'esc': 27,\n  'space': 32,\n  'page up': 33,\n  'page down': 34,\n  'end': 35,\n  'home': 36,\n  'left': 37,\n  'up': 38,\n  'right': 39,\n  'down': 40,\n  'insert': 45,\n  'delete': 46,\n  'super': 91,\n  'right click': 93,\n  'numpad *': 106,\n  'numpad +': 107,\n  'numpad -': 109,\n  'numpad .': 110,\n  'numpad /': 111,\n  'num lock': 144,\n  'scroll lock': 145,\n  'my computer': 182,\n  'my calculator': 183,\n  ';': 186,\n  '=': 187,\n  ',': 188,\n  '-': 189,\n  '.': 190,\n  '/': 191,\n  '`': 192,\n  '[': 219,\n  '\\\\': 220,\n  ']': 221,\n  '\\'': 222\n}\n\n/*!\n * Programatically add the rest\n */\n\nfor (var i = 48; i < 58; i++) codes[i - 48] = i\n// 0: 48\n// 1: 49\n// 2: 50\n// 3: 51\n// 4: 52\n// 5: 53\n// 6: 54\n// 7: 55\n// 8: 56\n// 9: 57\nfor (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32\n// a: 65\n// b: 66\n// c: 67\n// d: 68\n// e: 69\n// f: 70\n// g: 71\n// h: 72\n// i: 73\n// j: 74\n// k: 75\n// l: 76\n// m: 77\n// n: 78\n// o: 79\n// p: 80\n// q: 81\n// r: 82\n// s: 83\n// t: 84\n// u: 85\n// v: 86\n// w: 87\n// x: 88\n// y: 89\n// z: 90\nfor (i = 1; i < 13; i++) codes['f'+i] = i + 111\n// f1: 112\n// f2: 113\n// f3: 114\n// f4: 115\n// f5: 116\n// f6: 117\n// f7: 118\n// f8: 119\n// f9: 120\n// f10: 121\n// f11: 122\n// f12: 123\nfor (i = 0; i < 10; i++) codes['numpad '+i] = i + 96\n// numpad 0: 96\n// numpad 1: 97\n// numpad 2: 98\n// numpad 3: 99\n// numpad 4: 100\n// numpad 5: 101\n// numpad 6: 102\n// numpad 7: 103\n// numpad 8: 104\n// numpad 9: 105\n\n/**\n * Get by code\n *\n *   exports.name[13] // => 'Enter'\n */\n\nvar names = exports.names = {}\n\n// reverse mapping\nfor (i in codes) names[codes[i]] = i\n",
		"/node_modules/action/src/index.js": "\nvar slice = require('sliced')\n\nmodule.exports = function(fn){\n\treturn new Action(fn)\n}\n\nmodule.exports.class = function(fn, pins){\n\treturn function(){\n\t\tvar act = new Action(fn)\n\t\tif (pins) {\n\t\t\tfor (var i = 0, len = pins.length; i < len; i++) {\n\t\t\t\tact.pin(pins[i])\n\t\t\t}\n\t\t}\n\t\treturn act\n\t}\n}\n\nmodule.exports.Action = Action\n\nfunction Action(fn){\n\tthis.action = \n\tthis.send = fn\n\tthis.pins = {}\n\tthis.pin('out')\n}\n\nAction.prototype.on =\nAction.prototype.when = function(pin, action){\n\tif (typeof pin != 'string') {\n\t\taction = pin\n\t\tpin = typeof pin == 'function' && pin.name \n\t\t\t? pin.name\n\t\t\t: 'out'\n\t}\n\tif (typeof action == 'function') action.send = action;\n\t(this.pins[pin] || (this.pins[pin] = [])).push(action)\n\treturn this\n}\n\nAction.prototype.then =\nAction.prototype.connect = function(pin, action){\n\tif (typeof pin != 'string') {\n\t\taction = pin\n\t\tpin = typeof pin == 'function' && pin.name \n\t\t\t? pin.name\n\t\t\t: 'out'\n\t}\n\tif (typeof action == 'function') action = new Action(action);\n\t(this.pins[pin] || (this.pins[pin] = [])).push(action)\n\treturn action\n}\n\nAction.prototype.pin = function(name){\n\tthis[name] = this.dispatch.bind(this, name)\n\treturn this\n}\n\nAction.prototype.dispatch = function(pin){\n\tvar args = slice(arguments, 1)\n\tvar acts = this.pins[pin]\n\tif (!acts) return this\n\tfor (var i = 0, len = acts.length; i < len; i++) {\n\t\tvar act = acts[i]\n\t\tact.send.apply(act, args)\n\t}\n\treturn this\n}\n",
		"/node_modules/action/node_modules/sliced/index.js": "module.exports = exports = require('./lib/sliced');\n",
		"/node_modules/action/node_modules/sliced/lib/sliced.js": "\n/**\n * An Array.prototype.slice.call(arguments) alternative\n *\n * @param {Object} args something with a length\n * @param {Number} slice\n * @param {Number} sliceEnd\n * @api public\n */\n\nmodule.exports = function (args, slice, sliceEnd) {\n  var ret = [];\n  var len = args.length;\n\n  if (0 === len) return ret;\n\n  var start = slice < 0\n    ? Math.max(0, slice + len)\n    : slice || 0;\n\n  if (sliceEnd !== undefined) {\n    len = sliceEnd < 0\n      ? sliceEnd + len\n      : sliceEnd\n  }\n\n  while (len-- > start) {\n    ret[len - start] = args[len];\n  }\n\n  return ret;\n}\n\n"
	}
	return require("/index.js")
})