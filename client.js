const builder = require('./build');
const flatjs = require('./build/FlatJS/flat.js');

const express = require('express');
const app = express();
const jref = require('json-refs');

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

var destiny_client = function(api_key){
	this['backend'] = flatjs(setup_backend, [api_key], true);
	destiny_client = setup_functions(this);
	return destiny_client;
}


destiny_client.prototype.startTestServer = function(callback){
	var resolved = jref.resolveRefs(this.backend.spec)
	.then((res) => {
		//console.log(res.resolved.paths['/User/GetBungieNetUserById/{id}/'].get.responses['200'].content['application/json'].schema.properties.Response.properties);
		var paths = res.resolved.paths
	
		var path_res_map = [];
			
		//console.log(resolved.paths);
		for (p in paths){
				
			var robject = (typeof paths[p].get !== 'undefined') ? paths[p].get.responses['200'].content['application/json'].schema.properties : null;
			if(!robject) continue;
			
			
			var ex = /{.*?}/g
			var m;
			var params = [];
			while(m = ex.exec(p)) {
				params.push(m[0]); 
			}
			
			for (pr in params){
				var param = params[pr];
				p = p.replace(param, ":"+param.replace('{', '').replace('}', ''))
			}
			
			path_res_map.push({path: p, response: robject});
			
		}
		app.listen(3000, () => {
			//console.log("Server running on port 3000");
			this.backend.base = "http://localhost:3000";
			callback();
		});
		
		for (prm in path_res_map){
			var path_map = path_res_map[prm];
			//console.log(path_map);
			app.get(path_map.path, (req, res) => {
				var path = req.route.path;
				//console.log("Sending response for "+path);
				for(p in path_res_map){
					if(path_res_map[p].path == path){
						var jstring = JSON.stringify(path_res_map[p].response);
						res.send(jstring);
					}
				}
				
				
			});
		}
	});
}

module.exports = destiny_client;