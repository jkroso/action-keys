
# action-keys

  key dispatch for [action](//github.com/jkroso/action)

## Getting Started

_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_  

	$ {package mananger} install jkroso/action-keys

then in your app:

```js
var Dispatcher = require('action-keys')
```

## API

- [action-keys()](#action-keys)
- [plugin()](#plugin)

### action-keys()

```js
new Dispatcher()
	.on('ctrl + r', reload)
	.on('ctrl + shift + r', clearCache)
```

### plugin

for use with [presenter](//github.com/jkroso/presenter)

```js
presenter.use(require('action-keys/plugin'))
```

## Running the tests

```bash
$ npm install
$ make
```
Then open your browser to the `./test` directory.

_Note: these commands don't work on windows._ 

## License 

[MIT](License)