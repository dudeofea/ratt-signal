AllUsers = new Mongo.Collection('users');

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
			var info = AllUsers.findOne({_id: user_id});
			if(info == null){
				//default
				return 'signal.png';
			}
			if(info['checked_in'] == 1){
				//turn on
				return 'signal-filled.png';
			}else{
				//turn off
				return 'signal.png';
			}
		},
        user_list: function(){
            return AllUsers.find({checked_in: 1}).fetch();
        }
	});

	Template.ratt.events({
		'click img': function () {
			//toggle in the user status (and lightbulb)
			var info = AllUsers.findOne({_id: user_id});
			AllUsers.update({_id: user_id}, {checked_in: 1 - info['checked_in']});
		}
	});
}

if (Meteor.isServer) {
	Meteor.publish('db_ready', function(){
        return AllUsers.find({});
    });
}
