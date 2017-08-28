'use strict';

module.exports = errHandler;

function errHandler(handler, cb){
  return function(err){
    if (err && !handler(err)) {
      return;
    }

    try {
      cb.apply(null, [].slice.call(arguments));
    } catch (e) {
      handler(e);
    }
  };
}
