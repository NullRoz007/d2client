#!/usr/bin/env node

var spawn = require( 'child_process' ).spawn;
var fs = require('fs');
var flat_result = require('./flat-result.js');

/*
FlatJS require support
*/

var require_flat = function(module, cb){
  fs.readFile(module, (err, data) => {
    if(err) throw err;
    var module_string = String(data);
    parse(module_string, (result) => {
      var n = result.split('\n')[0].length;

      result = result.substring(n);
      var new_result = "var flatjs = require(\"../flat.js\");" + result;
      fs.writeFile(__dirname+"/flat_cache/"+module+"-flat.js", new_result, (err) => {
        var m = require(__dirname+"/flat_cache/"+module+"-flat.js");
        cb(m);
      });
    });
  });
}

/*
Basic flat function.
*/
var flat = function (f, args, unpack=false){
  var f_result;
  var returned_results;
  var flatResult = new flat_result();

  try{
    f(...args, function() {
      returned_results = [];
      for (a in arguments){
        arg = arguments[a];
        returned_results.push(arg);
      }
      if(arguments.length == 1) returned_results = arguments[0]
      f_result = returned_results;

    });
  }
  catch (err){
    if (err.message.indexOf("is not a function") != -1){
      err.message = "invalid callback in FLATED function";
    }

    flatResult.Error = err;
  }


  while(returned_results === undefined){
    require('deasync').runLoopOnce();
  }
  flatResult.Data = f_result;
  if(unpack){
    if(flatResult.Error) return flatResult.Error;
    else {
      return flatResult.Data;
    }
  }
  else{
    return flatResult;
  }
}

module.exports = flat;


if(require.main === module){
	/*
	flatjs cli
	*/

	var convert_to_flat = function(call){
	  var f_name = call.split('(')[0];
	  var param_ls = call.split('(')[1].split(')')[0];
	  return "flatjs("+f_name+", ["+param_ls+"])";
	}

	var parse = function(text, cb){
	  var proc = "";
	  var inString = false;
	  var inFlat = "";
	  var flatCall = "";
	  var packed = true;
	  var flatCalls = [];
	  var result = "var flatjs = require(\"./flat.js\");\n"+text;
	  for (c = 0; c < text.length; c++){
		var char = text[c];
		proc += char;
		inString = (char == '"' || char == "'") ? true : false;
		var check = proc.substr(proc.length - 5);

		if(check.substr(check.length - 4) == "flat" && text[c + 1] == " "){

		  proc == "";
		  inFlat = true;
		  c += 1;
		}

		if(inFlat){
		  flatCall += char;
		  if(char == ')'){
			proc = "";
			flat_call_final = convert_to_flat(flatCall.substr(1));
			result = result.replace("flat "+flatCall.substr(1), flat_call_final);
			flatCall = "";
			inFlat = false;
		  }
		}
	  }
	  cb(result);
	}


	var write_raw = false;
	/*
	Commander setup.
	*/
	var program = require("commander");
	program.version("1.0.1")
		   .usage('[options] <filename...>')
		   .option('-s, --save', 'Save the resultant flatted Javascript file.');

	program.on('--help', function(){
	  console.log("");
	  console.log("  Examples:");
	  console.log("  (Code examples can be found in /examples/)");
	  console.log("");
	  console.log("    $ flat flatexample.js ");
	  console.log("    $ flat -s flatexample.js");
	  console.log("    $ flat --help");
	  console.log("");
	});

	program.parse(process.argv);

	if(program.args.length == 0){
	  console.log("No file specified, use flat --help for usage information.");
	  process.exit(1);
	}

	write_raw = program.save;
	var filename = program.args[0];

	fs.readFile(filename, (err, data) => {
	  var sData = String(data);
	  fs.mkdir(__dirname+"/flat_cache", () => {});
	  parse(sData, (result) => {
		  if(write_raw){
			var path = require("path");
			fs.writeFile("./"+path.basename(filename)+"-flat.js", result, (err) => {
			  if(err) throw err;
			});
		  }
		eval(result);
	  });

	});
}
