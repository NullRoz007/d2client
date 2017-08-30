var flatjs = require("../flat.js");
var request = require("request");
var fs = require("fs");
function get_request(url, headers, cb){
  var options = {
    "url": url,
    "headers": headers
  };

  request(options, (error, response, body) => {
    var jResult = JSON.parse(body);
    cb(jResult);
  });
}



/*
Blocking:
*/
var get_memid = function(display_name){
  console.log("Making request...")
  var result = flatjs(get_request, ["http://bungie.net/platform/Destiny/2/Stats/GetMembershipIdByDisplayName/"+display_name, {"X-API-Key": "56f2f2790c9f40a082eede48ed9f5592"}]);
  if(result.Error) throw result.Error;

  var response = result.Data;
  return response.Response;
}

module.exports = {
  GetMembershipIdByDisplayName: get_memid
};
