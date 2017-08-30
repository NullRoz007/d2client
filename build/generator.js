var request = require('request');
var ClientError = require('./ClientError.js');

var client = {
	base: "",
	spec: {},
	authorization: {
		headers: {},
		oauth2: {}
	},
	definitions: {},
	mapping: [],
	types: {}
};

function get_class_names(paths){
	var classes = [];
	for (p in paths){
		var path = paths[p];
		var request_type = (typeof path.get !== 'undefined') ? "get" : "post";
		var class_name = path[request_type].operationId.split('.')[0];
		if(classes.indexOf(class_name) == -1) classes.push(class_name);
	}
	return classes;
}

function create_types(components, type_class){
	var schemas = components.schemas;
	var responses = components.responses;
	var types = {schema: [], responses: []};
	
	for (s in schemas){
		if(String(s).split('.')[0] == type_class){
			var type_name = String(s).replace(type_class+".", "");
			types.schema[s] = schemas[s];
			//text += "/*"+s+"*/\nvar "+type_name+ " = " + JSON.stringify(schemas[s])+"\n\n";
		}
		
	}
	
	for (r in responses){
		if(String(r).split('.')[0] == type_class){
			var type_name = String(r).replace(type_class+".", "");
			types.responses[r] = responses[r];
			//text += "/*"+s+"*/\nvar "+type_name+ " = " + JSON.stringify(schemas[s])+"\n\n";
		}
		
	}
	return types;
}

function get_function_names(paths, c_name) {
	var functions = [];
	for (p in paths){
		var path = paths[p];
		var request_type = (typeof path.get !== 'undefined') ? "get" : "post";
		var function_name = path[request_type].operationId.split('.')[1];
		var class_name = path[request_type].operationId.split('.')[0];
		
		if(c_name == class_name){
			functions.push(function_name);
		}
		
	}
	return functions;
}

function build_response_mapping(paths){
	var maps = [];
	for (p in paths){
		var map = {
			top: 'response',
			path: p,
			class_name: '',
			type: ''
		};
		var path = paths[p];
		var request_type = (typeof path.get !== 'undefined') ? "get" : "post";	
		var responses = path[request_type].responses;
		var ok_response_type = responses['200']['$ref'].split('#/components/responses/')[1];
		map.class_name = path.summary.split('.')[0];
		map.type = (typeof ok_response_type.split('.')[1] === 'undefined') ? ok_response_type : ok_response_type.split('.')[1];
		maps.push(map);
	}
	return maps;
}

function handle_result(response, result){
	var type;
	var href = response.request.uri.href.replace('www.', '');
	var path_name = href.split(client.base)[1];
	if (result.Response && result.Response.data) {
         mapped_result = result.Response.data;
    } else if (result.Response) {
        mapped_result = result.Response;
    } else {
        mapped_result = result;
	}
	
	var isArray = Array.isArray(mapped_result);
}

function build_function(paths, c_name, f_name){
	for (p in paths){
		var path = paths[p];
		if(path.summary.split('.')[1] == f_name){
			var request_type = (typeof path.get !== 'undefined') ? "get" : "post";
			var url = p;
			var query = [];
			var call = function(params, callback){
				var u = url;
				var p = path;
				for (prm in path[request_type].parameters){
					var parameter = path[request_type].parameters[prm];
					if(parameter.in == "path"){
						if(params[parameter.name]) u = (u.indexOf("{"+parameter.name+"}" == -1)) ? u + params[parameter.name] : u.replace('"{"+parameter.name+"}", params[parameter.name]');
					}
					else if(parameter.in == "query"){
						query.push(parameter.name + "=" + params[parameter.name])
					}
				}
				
				var options = {
					url: client.base + u + "?"+query.join('&'),
					headers: client.authorization.headers
				};
				//console.log(options);
				
				
				if(request_type == "get") {
					
					request(options, (error, response, body) => {
						//console.log(body);
						if(error) callback(error);
						var handled = handle_result(response, JSON.parse(body));
						callback(handled);
					});
				}
				else {
					var request_body_schema = p.post.requestBody.content['application/json'].schema['$ref'];
					var base_name = request_body_schema.split('#/components/schemas/')[1].split('.')[0];
					//console.log(request_body_schema.split('#/components/schemas/')[1]);
					
					var param_names = [];
					for(p_name in params){
						param_names.push(p_name);
					}
					options['body'] = {};
					for(t in client.types[base_name].schema){
						if(t == request_body_schema.split('#/components/schemas/')[1]){
							//console.log(client.types[base_name].schema[t].properties);
							for (p_name in client.types[base_name].schema[t].properties){
								if(param_names.indexOf(p_name) == -1){
									var error = ClientError.MissingRequiredParameterInRequestBody;
									error.data = {
										missing: p_name
									};
									
									callback(ClientError);
								}
								else{
									options.body[p_name] = params[p_name]
								}
							}
						}		
					}
					
					request.post(options, (error, response, body) => {
						if(error) callback(error);
						var json = JSON.parse(body);
						//console.log(body);
						var handled = handle_result(json);
						callback(handled);
					});
				}
			}
			return call;
		}		
	}
}

module.exports = function(specification, valid_names){
	//console.log("Building "+specification.info.title + " - "+specification.info.version);
	client.base = specification.servers[0].url;
	var classes = get_class_names(specification.paths);
	client['functions'] = {};
	client.mapping = build_response_mapping(specification.paths);
	
	for (c in classes){
		var class_name = classes[c];
		client['functions'][class_name] = {};
		var functions = get_function_names(specification.paths, class_name);
		for(f in functions){
			var func_name = functions[f];
			
			client['functions'][class_name][func_name] = build_function(specification.paths, class_name, func_name);
		}
	}
	
	for (n in valid_names){
		var name = valid_names[n];
		if(name == "Destiny2") name = "Destiny";
		var types = create_types(specification.components, name);
		client.types[name] = types;
	}
	client.spec = specification;
	
	return client;
};
