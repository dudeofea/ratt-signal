AllUsers = new Mongo.Collection('users');
//process.env.COMPE_SLACK = ""; //Uncomment and put key here

if (Meteor.isClient) {
	var db_ready = false;
	Session.set('light_image', 'signal.png');
	//wait for db to be ready
	Meteor.subscribe('db_ready', function(){
		if(!db_ready){
			db_ready = true;
			//get previous user_id
			//create a new user if doesn't exist
			var user_id = Session.get('user_id');
			if(AllUsers.find({"_id": user_id}).count() < 1){
				user_id = Random.id();
				AllUsers.insert({_id: user_id, checked_in: 0});
				Session.setPersistent('user_id', user_id);
			}
		}
	});

    Template.registerHelper('format_date', function(date) {
        if (!date){
            return "";
        }
        return date.getHours() % 12 + ":" +
                (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() )
                + " "
                + (date.getHours() >= 12 ? "PM" : "AM");
    });

	Template.ratt.helpers({
		user_count: function () {
			return AllUsers.find({checked_in: 1}).count();
		},
		light_image: function() {
			var turnOn = AllUsers.find({checked_in: 1}).count();
			//console.log(turnOn);
			if(turnOn > 0){
				//Turn on
				return 'signal-filled.png';
			}
			else{
				//Turn off
				return 'signal.png';
			}			
		},
		activate_status: function() {
			var user_id = Session.get('user_id');
			var info = AllUsers.findOne({_id: user_id});
			if(info == null){
				//default
				return 'Activate';
			}
			if(info['checked_in'] == 1){
				//turn on
				return 'Deactivate';
			}else{
				//turn off
				return 'Activate';
			}
		},
        user_list: function(){
            return AllUsers.find({checked_in: 1}).fetch();
        }

	});

	Template.ratt.events({
		'submit .nameForm': function (event) {
      		event.preventDefault();
			//debugger;
			//console.log("Triggered");
			var user_id = Session.get("user_id");
			var info = AllUsers.findOne({_id: user_id});
			if(!(info['checked_in'] == 1) && !event.target.name.value){
				alert("Please enter your name!");
			}
			else{
				//toggle in the user status (and lightbulb)
				AllUsers.update({_id: user_id}, {checked_in: 1 - info['checked_in'], name: event.target.name.value, time: new Date() });
				if(!(info['checked_in'] == 1) && event.target.name.value){
					Meteor.call('activateRattSignalSlack', event.target.name.value, function(err,response) {
					if(err) {
						Console.log("Error:" + err.reason);
						return;
					}
					});
				}
			}
		}
	});
}

if (Meteor.isServer) {
	var rattSignalBot;	
	var slackParams = {
    		icon_emoji: ':rotating_light:'
	};
	Meteor.startup(function() {
        var SlackBot = Meteor.npmRequire('slackbots');
		var slackParams = {
    		icon_emoji: ':rotating_light:'
		};
		rattSignalBot = new SlackBot({
    		token: process.env.COMPE_SLACK,
    		name: "rattsignal"
		});
        rattSignalBot.on('start', function() {
			//rattSignalBot.postMessageToChannel('ratt-signal', 'Hello World, I am the Ratt Signal!', slackParams);
        });
		rattSignalBot.on('message', function(data) {
    		//console.log(data);
		});
		Meteor.methods({
	  		activateRattSignalSlack: function (name) {
				rattSignalBot.postMessageToChannel('ratt-signal', ':rotating_light: ' + name + ' has activated the Ratt Signal! :rotating_light:', slackParams);
	  		}
		});
    });
	Meteor.publish('db_ready', function(){
        return AllUsers.find({});
    });
	Meteor.setInterval(function() {
		AllUsers.remove({$and:[{checked_in: 1}, {time: {$lt: new Date((new Date())-1000*60*60*3) }}]});
	}, 300000);
}
