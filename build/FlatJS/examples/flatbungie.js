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

var get_memid = function(display_name){
  console.log("Making request...")
  var result = flat get_request("http://bungie.net/platform/Destiny/2/Stats/GetMembershipIdByDisplayName/"+display_name, {"X-API-Key": "NO NO"});
  if(result.Error) throw result.Error;

  var response = result.Data;
  return response.Response;
}

module.exports = {
  GetMembershipIdByDisplayName: get_memid
};
