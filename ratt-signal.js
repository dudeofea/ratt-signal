AllUsers = new Mongo.Collection('all_users');

if (Meteor.isClient) {
	//create a new user if doesn't exist
	var user_id = Session.get('user_id');
	//check if user exists
	var oid = new Mongo.ObjectID(user_id);
	if(AllUsers.find(oid).count() < 1){
		user_id = AllUsers.insert({checked_in: 0});
		Session.setPersistent('user_id', user_id);
	}

	Template.ratt.helpers({
		user_count: function () {
			return AllUsers.find({}).count();
		}
	});

	Template.ratt.events({
		'click img': function () {
			// increment the counter when button is clicked
			Session.set('counter', Session.get('counter') + 1);
		}
	});
}

if (Meteor.isServer) {
}