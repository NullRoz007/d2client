# err-handler [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]
> Avoid if(err) return bla bla bla.

```
Some say the definition of insanity is to repeat the same thing over and over again
for no reason...
```

## Without err-handler
````javascript
app.get('/', function(req, res, next){
  Resource.get(function(err, resource){
    if(err)return next(err);
    res.json(resource);
  });
});
````

## With err-handler
````javascript
app.get('/', function(req, res, next){
  Resource.get(errHandler(next, function(err, resource){
    res.json(resource);
  });
});
````

_Let's avoid lines of code!_

## The gist

* `err-handler` takes 2 functions (`handler, cb`) and returns a function.
* If the returned function is passed an error, `err-handler` calls `handler` with
said error (you don't have to worry about handling it in your callback).
* If the handler returns any value not equal to `undefined`, `err-handler` calls `cb`
as if nothing happened.  This is useful for logging handlers.
* If the returned function receieves no error, then `cb` is called normally and
`handler` is never called.

## License

```
The MIT License (MIT)

Copyright (c) 2013 Joseph Spencer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

[downloads-image]: http://img.shields.io/npm/dm/err-handler.svg
[npm-url]: https://npmjs.org/package/err-handler
[npm-image]: http://img.shields.io/npm/v/err-handler.svg

[travis-url]: https://travis-ci.org/jsdevel/node-err-handler
[travis-image]: http://img.shields.io/travis/jsdevel/node-err-handler.svg

[coveralls-url]: https://coveralls.io/r/jsdevel/node-err-handler
[coveralls-image]: http://img.shields.io/coveralls/jsdevel/node-err-handler/master.svg
