
var Dispatcher = require('./')

module.exports = function(pres){
	var action = new Dispatcher
	pres.action('keydown=>keydown', action)
	pres.action('keyup=>keyup', action)
	return action
}