var generate = require('./generator.js');
var request = require('request');
var fs = require('fs');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var API_KEY = "";
var SPEC_URL = "https://raw.githubusercontent.com/Bungie-net/api/master/openapi.json";
/*
Generate the Service
*/
var generate_wrapper = function(file, cb){
	fs.readFile(file, (err, data) => {
		var jSpec = JSON.parse(data);
		//console.log("Building...");
		var client = generate(jSpec, valid_path_bases);
		//console.log(client);
		cb(client);
	});
}

/*
List of invalid references in the spec.
*/
var invalid_schema_references = [
	"#/components/schemas/Destiny.HistoricalStats.DestinyLeaderboard"
];

var valid_path_bases = [
 "User",
 "Destiny2"
];

/*
Clean the spec of invalid schema references, 
remove paths we don't need (CommunityContent, etc)
*/
var clean_spec = function(spec_string){
	
	var jObject = JSON.parse(spec_string);
	//console.log("Fixing host.");
	jObject.host = "bungie.net";
	
	//console.log("Removing paths.");
	for (path in jObject.paths){

		var base = path.split('/')[1];
		if(valid_path_bases.indexOf(base) == -1){
			delete jObject.paths[path];
		}
	}
	
	spec_string = JSON.stringify(jObject);
	
	for (isr in invalid_schema_references) {
		//console.info("Removing: "+invalid_schema_references[isr]);
		spec_string = spec_string.replaceAll("\"$ref\": \""+invalid_schema_references[isr]+"\"", "");
	}
	return spec_string;
}

var download_spec = function(cb){
	request(SPEC_URL, (error, response, body) => {
		cb(body);
	});
}

var b = function(cb){
	download_spec(spec => {
		var c_spec = clean_spec(spec);
		
		fs.writeFile("./spec.json", c_spec, (error) => {
			if(error) throw error;
			generate_wrapper("./spec.json", (client) => {
				cb(client);
			});
			
		});
	});
}


module.exports = function(apikey, cb){
	b((client) => {
		client.authorization.headers['X-API-Key'] = apikey;
		cb(client);
	});	
}
