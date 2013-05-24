
var Presenter = require('presenter').Presenter
  , keyDispatch = require('../plugin')

var car = new Presenter('<div id="car" tabIndex="1">5</div>')
var view = car.view
var v = 10

car.use(keyDispatch)
	.on(function left(e){
		view.style.left = view.offsetLeft - v + 'px'
	})
	.on(function right(e){
		view.style.left = view.offsetLeft + v + 'px'
	})
	.on('shift + right', function(){
		view.style.left = view.offsetLeft + v * 5 + 'px'
	})
	.on('shift + left', function(){
		view.style.left = view.offsetLeft - v * 5 + 'px'
	})
	.on('ctrl + alt + super + up', function(){
		view.style.background = '#bada55'
	})
	.on('ctrl + alt + super + down', function(){
		view.style.background = '#55adab'
	})

document.body.appendChild(view)
view.focus()
