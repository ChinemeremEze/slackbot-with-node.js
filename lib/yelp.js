const YelpAPI = require('yelp-api');
const dotenv = require('dotenv').config();
var https = require('https');
var querystring = require('querystring');


class Yelp{
    constructor(){
        this.api = new YelpAPI(process.env.YELP_API_KEY);
    }
    //
    //RESTURANTS
    //

    //Get x nearby resturants
     getResturants = (access_token, search_req, commandCallback,extras) =>{
        var myreq = search_req;
    
        var myreqstr = querystring.stringify(myreq);
    
        var options = {
            host: 'api.yelp.com',
            port: '443',
            path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
            method: 'get',
            headers : {
                'Authorization' : 'Bearer ' + access_token,
            }
        }
        if(extras != null && extras.reviews){
            options.path = '/v3/businesses/'+extras.id+'/reviews';
        }
        if(extras != null && extras.phone){
            myreqstr = myreqstr.replace('%2B','+');
            options.path = '/v3/businesses/search/phone?'+myreqstr;
        }
        var callback = (res) =>{
            var str = "";
            res.on('data', (chunck) =>{
                str += chunck;
            });
            res.on('end',()=>{
                commandCallback(str);
            });
        }
        var req = https.request(options,callback).end();
    }
    /**/
    
    /* Yelp Get TOKEN */
     getYelpToken = (search_req,commandCallback,extras) => {
        var authreq = {
            'api_key' : process.env.YELP_API_KEY
        }
        var authreqstr = querystring.stringify(authreq);
        var authoptions = {
            host: 'api.yelp.com',
            port: '443',
            path: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type':'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(authreqstr)      
            }
        }
        var callback = (res) => {
            var str = "";
            res.on('data',(chunck)=>{
                str += chunck;
            });
            res.on('end',()=>{
                var token = process.env.YELP_API_KEY;
                this.getResturants(token,search_req,commandCallback,extras);
            });
        }
        var req = https.request(authoptions,callback);
        req.write(authreqstr);
        req.end();
    }
    /* End of Get token function */
    
     async callYelpRequest(search_req, command, commandCallback , extras = null){
        this.getYelpToken(search_req,commandCallback,extras);
    }
}
module.exports = Yelp;