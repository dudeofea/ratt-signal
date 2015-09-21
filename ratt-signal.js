AllUsers = new Mongo.Collection('all_users');

if (Meteor.isClient) {
	var db_ready = false;
	var user_id = Session.get('user_id');
	Session.set('light_image', 'signal.png');
	//wait for db to be ready
	Meteor.subscribe('db_ready', function(){
		if(!db_ready){
			db_ready = true;
			//get previous user_id
			//create a new user if doesn't exist
			if(AllUsers.find({"_id": user_id}).count() < 1){
				user_id = Random.id();
				AllUsers.insert({_id: user_id, checked_in: 0});
				Session.setPersistent('user_id', user_id);
			}
		}
	});

	Template.ratt.helpers({
		user_count: function () {
			return AllUsers.find({checked_in: 1}).count();
		},
		light_image: function() {
			return Session.get('light_image');
		}
	});

	Template.ratt.events({
		'click img': function () {
			//toggle in the user status (and lightbulb)
			var info = AllUsers.findOne({_id: user_id});
			if(info['checked_in'] == 0){
				//turn on
				Session.set('light_image', 'signal-filled.png');
			}else{
				//turn off
				Session.set('light_image', 'signal.png');
			}
			AllUsers.update({_id: user_id}, {checked_in: 1 - info['checked_in']});
		}
	});
}

if (Meteor.isServer) {
	Meteor.publish('db_ready', function(){
        return AllUsers.find({});
    });
}