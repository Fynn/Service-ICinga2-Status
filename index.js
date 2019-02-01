//Icinga 2 Status

//requires
const Gpio = require('onoff').Gpio;
const fetch = require('node-fetch');
const base64 = require('base-64');
const https = require("https");

//Gpio
const red = new Gpio(17, 'out');
const yellow = new Gpio(27, 'out');
const green = new Gpio(22, 'out');

//variables
var url = 'https://monitoring.dev02.loom-technologies.com:5665/v1/objects/services?joins=host&filter=service.state!=ServiceOK';
var user = 'status';
var password = 'bDQzuHMhxGDGbBUocJ99AjzHJTxqLpGpdXDk7eZB';
var serviceError;
var serviceErrorID;
var state; //STATES:  0=GREEN, 1=YELLOW, 2=RED


//First start
execute();

//Invterval = 20s
setInterval(function() { 

    execute();

}, 20000);

//execute fetch
async function execute() 
{

    const agent = new https.Agent({ rejectUnauthorized: false })

    try {
        const res = await fetch(
            url, 
            {
                agent, 
                headers: 
                {
                    Authorization: 'Basic ' + base64.encode(user + ":" + password), 
                    'Content-Type': 'application/json'
                } 
            }
        )

        const resAsJson = await res.json();
        serviceError = resAsJson.results.length;
        if(serviceError > 0) {
            serviceErrorID = resAsJson.results[0].attrs.state;
            if(serviceErrorID == 1) {
                state = 1;
            } else { 
                state = 2; 
            }
        } else { 
            state = 0; 
        }
        
        


        controlLED();


             
    } catch (error) {
        console.error(error);        
    }
}

function controlLED() {

    if(state == 0) {
        yellow.writeSync(0);
        red.writeSync(0);
        green.writeSync(1);
        console.log('\x1b[32m' + 'STATUS' + '\x1b[0m' + ' > All services are available!');
    } else if(state == 1) {
        yellow.writeSync(1);
        red.writeSync(0);
        green.writeSync(0);
        console.log('\x1b[33m' + 'STATUS' + '\x1b[0m' + ' > One or more services are pending!');
    } else {
        yellow.writeSync(0);
        red.writeSync(1);
        green.writeSync(0);
        console.log('\x1b[31m' + 'STATUS' + '\x1b[0m' + ' > One or more services are unavailable!');
    }
    console.log('ERROR-ID > '+ state + '\n');
}
