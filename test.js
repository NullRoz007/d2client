var d2client = require('./client.js');
var DestinyClient = new d2client("56f2f2790c9f40a082eede48ed9f5592");
DestinyClient.User.SearchUsers({q: "NullRoz007"}, (result) => {
	console.log(result);
});
