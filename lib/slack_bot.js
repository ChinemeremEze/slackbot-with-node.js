const Bot = require('slackbots');
const Yelp = require("./yelp.js");
const dotenv = require('dotenv').config();
const Logger = require("./logger.js");
let logger = new Logger('./textlog.txt');

//var bot = new Bot(settings);
var yelp = new Yelp();

class SlackBot {
	constructor(handle = 'yelphelp'){
        this.handle = handle;
        this.ready = false;
        this.yelp = new Yelp();

        this.settings = {
            token: process.env.SLACK_TOKEN,
            name: this.handle
        }

        this.instance = new Bot(this.settings);
        this.instance.on('start', this.started.bind(this));
        this.instance.on('message', this.messaged.bind(this));
    }

    started(){ 
        this.ready = true;
        console.log("SlackBot is ready.");
    }
    messaged(data){
       
        this.msg = data;
        // Check which type of data we are receiving
        switch(data.type){
            case "message":
                var command = data.text.split(' ');
                switch(command[0]){
                    case 'Nearby':
                        this.nearby();
                        break;
                    case 'Closeby':
                        this.closeby();
                        break;
                    case 'Top':
                        this.top();
                        break;
                    case 'Closest':
                        this.closest();
                        break;
                    case 'FindMe':
                        this.findme();
                        break;
                    case 'Reviews':
                        this.reviews();
                        break;
                    case 'SearchByPhone':
                        this.searchbyphone();
                        break;
                }
            }
        }
    
	loopThroughAllRestaurants(str,err){
		var restaurants = JSON.parse(str);
		var bot_response = "";
		if(restaurants.error == undefined){
			if(restaurants.total > 0){
				for(var i = 0; i < restaurants.businesses.length; i++){
					bot_response += "("+(i+1)+")" + "(Name): " + restaurants.businesses[i].name + 
								", (Address): " + restaurants.businesses[i].location.address1;
					if(restaurants.businesses[i].location.address2 != ''){
						bot_response += " " + restaurants.businesses[i].location.address2 + " ";
					}
					if(restaurants.businesses[i].location.address3 != ''){
						bot_response += " " + restaurants.businesses[i].location.address3 + ", ";
					}
					bot_response += restaurants.businesses[i].location.city + " " + 
									restaurants.businesses[i].location.state + "," +
									restaurants.businesses[i].location.country + " " +
									restaurants.businesses[i].location.zip_code + " ";
					if(this.showRating){
						bot_response += "(Rating): " + restaurants.businesses[i].rating + "\n";
					}	else{
						bot_response += "\n";
					}
				}
				logger.log(bot_response);
				this.instance.postMessageToChannel('general',bot_response);
			}else{
				this.instance.postMessageToChannel('general',err);
			}
		}else{
			this.instance.postMessageToChannel('general',err);
		}
	}

	provideReviewDetails(str,err){
		var restaurants = JSON.parse(str);
		var bot_response = "";
		if(restaurants.error == undefined){
			if(restaurants.total > 0){
				var iterator = 3;
				if(restaurants.total < 3){
					iterator = restaurants.total;
				}
				for(var i = 0; i < iterator; i++){
					bot_response += "("+(i+1)+")" + restaurants.reviews[i].user.name + 
									"\n(Review Text): " + restaurants.reviews[i].text + "\n" + 
									" (Rating): " + restaurants.reviews[i].rating +"\n"+ 
									"(Link): "+restaurants.reviews[i].url + "\n";
				}
				logger.log(bot_response);
				this.instance.postMessageToChannel('general',bot_response);
			}else{
				this.instance.postMessageToChannel('general',err);
			}
		}else{
			this.instance.postMessageToChannel('general',err);
		}
	}

	nearby(){
		console.log("Nearby command runs");
		var parsed = this.msg.text.split('Nearby');
		var search_req = {
			'term' : 'restaurants',
			'location' : parsed[1],
			'limit' : 5,
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
		this.yelp.callYelpRequest(search_req,'nearby',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}

	closeby(){
		console.log("Closeby command runs");
		var parsed = this.msg.text.split(' ');
		if(parsed[1].includes("W")){
			parsed[1] = -1 * parseFloat(parsed[1]);
		}else{
			parsed[1] = parseFloat(parsed[1]);
		}

		if(parsed[2].includes("S")){
			parsed[2] = -1 * parseFloat(parsed[2]);
		}else{
			parsed[2] = parseFloat(parsed[2]);
		}
		var search_req = {
			'term' : 'restaurants',
			'longitude' : parsed[1],
			'latitude' : parsed[2],
			'limit' : 5,
			'radius' : 10000,
		};
		var error = "No closeby restaurants can be found";
		this.yelp.callYelpRequest(search_req,'closeby',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	top(){
		console.log("Top command runs");
		var parsed = this.msg.text.split(" ");
		var xNumber = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(" ");
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'limit' : xNumber,
			'sort_by' : 'rating',
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
        this.yelp.callYelpRequest(search_req,'top',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	closest(){
		console.log('Closest command runs');
		var parsed = this.msg.text.split(" ");
		var xNumber = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(' ');
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'limit' : xNumber,
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
		this.yelp.callYelpRequest(search_req,'closest',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	findme(){
		this.showRating = true;
		console.log('FindMe command runs');
		var parsed = this.msg.text.split(" ");
		var category = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(' ');
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'categories' : category,
			'radius' : 20000,
		};
		var error = "No "+category+" restaurant can be found";
		this.yelp.callYelpRequest(search_req,'findme',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	/**
		@name review()
		@return null
	*/
	reviews(){
		var addressFormula = /[0-9]{1,6} [\w\s]{3,} [\w,\s]{2,}/g;
		var address = this.msg.text.match(addressFormula);
		var parsed = this.msg.text.replace(addressFormula,'');
		parsed = parsed.split(' ');
		parsed.splice(0,1);
		var name = parsed.join(' ');
		var search_req = {
			'term' : name,
			'location' : address,
		};
		var error = name+" cannot be found";
		this.yelp.callYelpRequest(search_req,'top',(str)=>{
			var id = JSON.parse(str).businesses[0].id;
			this.yelp.callYelpRequest(search_req,'top',(str)=>{
				this.provideReviewDetails(str,error);
			},{reviews:true,id:id});
		});
	}
	searchbyphone(){
		var parsed = this.msg.text.split(' ');
		var phone = '+'+parsed[1];
		var search_req = {
			'phone':phone
		}
		var error = "No restaurant with phone number "+phone+" can be found";
		this.yelp.callYelpRequest(search_req,'searchbyphone',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		},{phone:true});
    }
}

module.exports = SlackBot;