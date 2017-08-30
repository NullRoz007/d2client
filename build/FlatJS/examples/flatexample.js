var bungie = (flat require_flat("flatbungie.js")).Data;
var membership_id = bungie.GetMembershipIdByDisplayName("NullRoz007");
console.log(`NullRoz007's MembershipId is ${membership_id}`);
