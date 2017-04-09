/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Send a message with attachments
* Send a message via direct message (instead of in a public channel)

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node demo_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "Attach"

  The bot will send a message with a multi-field attachment.

  Send: "dm me"

  The bot will reply with a direct message.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('../lib/Botkit.js');
var Clarifai = require('clarifai'); 
var Promise = require('es6-promise').Promise;
var app = new Clarifai.App('hLLhJ3UJTAx9qj9Acg2OXR5pYWNX2siyE2cDn31T', 'ltt-jTCUB7g6E6w2vngshBxv-0VGz6wttmfH0E9c');
var sentiment = require('sentiment');   
var filters = [];
var adminID = [];
var userdata = [];
function analysis(sentence) {   
	var cent = sentiment(sentence);
	return cent; 
}  
if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
 debug: false
});

controller.spawn({
  token: process.env.token
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});
controller.on('rtm_open', function(bot,message){
	bot.api.users.list({}, function(err, response){
		for(var i = 0; i < response['members'].length; i++){
			if(response['members'][i]['is_admin'])adminID.push(response['members'][i]['id']);	
			userdata[response['members'][i]['id']] = response['members'][i]['name'];
		}
		console.log(adminID);
	});
});
controller.on('ambient',function(bot,message) {    
	var messageText = message.text;
	console.log(message);
	if(messageText.indexOf("http") == 1 ){
		messageText = messageText.substring(1,messageText.length-1);
		app.models.predict(Clarifai.GENERAL_MODEL, messageText).then( 
			function(response) {
				for(var i = 0; i<response['outputs'][0]['data']['concepts'].length;i++){
				//for( concept in response['outputs'][0]['data']['concepts']){
					if(filters.indexOf(response['outputs'][0]['data']['concepts'][i]['name']) > -1){
						bot.reply(message, "This content has been deemed inappropriate by the admins. \nReason: " + response['outputs'][0]['data']['concepts'][i]['name']);  
						var tempMessage = message;
						for(var j=0;j<adminID.length;j++){
							var context = {user : adminID[j], channel : message.channel};
							bot.startPrivateConversation(context, function(err, dm){
								dm.say("A picture sent by " + userdata[tempMessage.user] + " in the slack channel has been flagged for inappropriate material");
							});
						}
						break;
						//console.log('Yes');
					}
					//console.log(concept['name']);
					//console.log(response['outputs'][0]['data']['concepts'][i]['name']);
				}
   			},
			function(err) {     console.error(err);   } );
	}	
	else{
		if(analysis(messageText)['score'] < -2){
			bot.reply(message, "Your message is too negative");
			console.log(analysis(messageText)['score']);
		}
	}
});

controller.hears(['.filter', '.remove'],['direct_message', 'ambient'],function(bot,message) {
	if(adminID.indexOf(message.user) > -1){
		var filtersToAdd = message.text.split(" ");
		if(filtersToAdd[0] == ".filter"){
			for(var i = 1; i < filtersToAdd.length; i++){
				filters.push(filtersToAdd[i].toLowerCase());
			}
		}
		else{
			for(var i = filtersToAdd.length-1;i > 0;i--){
				var idx = filters.indexOf(filtersToAdd[i]);
				if(idx > -1) filters.splice(idx,1);	
			}
		}
	}
    //bot.reply(message, message);
});
/*
controller.on('file_created', function(file) {console.log("file upload testing" + file)});
controller.hears(['attach'],['direct_message','direct_mention'],function(bot,message) {

  var attachments = [];
  var attachment = {
    title: 'This is an attachment',
    color: '#FFCC99',
    fields: [],
  };

  attachment.fields.push({
    label: 'Field',
    value: 'A longish value',
    short: false,
  });

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  });

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  });

  attachments.push(attachment);

  bot.reply(message,{
    text: 'See below...',
    attachments: attachments,
  },function(err,resp) {
    console.log(err,resp);
  });
});

controller.hears(['dm me'],['direct_message','direct_mention'],function(bot,message) {
  bot.startConversation(message,function(err,convo) {
    convo.say('Heard ya');
  });

  bot.startPrivateConversation(message,function(err,dm) {
    dm.say('Private reply!');
  });

});*/
