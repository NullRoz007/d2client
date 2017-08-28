var builder = require('./build');
var flatjs = require('./build/FlatJS/flat.js');

var setup_backend = function(apikey, cb){
	builder(apikey, (backend) => {
		cb(backend);
	});
}

var setup_functions = function(client){
	//console.log(client.backend.functions);
	for (c in client.backend.functions){
		client[c] = {};
		for(f in client.backend.functions[c]){
			client[c][f] = client.backend.functions[c][f];
		}
	}
	return client;
}
/*

*/

var destiny_client = function(api_key){
	this['backend'] = flatjs(setup_backend, [api_key], true);
	destiny_client = setup_functions(this);
	return destiny_client;
}

module.exports = destiny_client;