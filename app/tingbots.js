"use strict";

const EventEmitter = require('events');
var mdns = require('multicast-dns')();

var tingbots = [];

var minutes = 5,
  the_interval = minutes * 60 * 1000;

class Tingbots extends EventEmitter {
  getTingbots(){

    return tingbots;
  }
}
const tingbotsEmitter = new Tingbots();

mdns.on('response', function(response) {
  console.log('got a response packet:', response);
  if (response.questions.length === 0) {
    return;
  }

  if(response.questions[0].name == "_tingbot-ssh._tcp.local") {
    for(var i in response.answers){
      if(response.answers[i].type == 'SRV'){
        console.log('IDENTIFIED TINGBOT SRV:' + JSON.stringify(response.answers[i].data));
      }
      if(response.answers[i].type == 'A'){
        console.log('IDENTIFIED TINGBOT:' + response.answers[i].name + "@" + response.answers[i].data);
        addTingBot(response.answers[i].name,response.answers[i].data);
      }
    }
  }
});

function updateDNS(){
  console.log("DNS Ping");
  mdns.query({
  questions:[{
    name: '_tingbot-ssh._tcp.local',
    type: 'PTR'
  }]
});
}

function addTingBot(name,address){
  for(var i in tingbots){
    if(tingbots[i].address == address ){
      tingbotsEmitter.emit('refreshTingBots',tingbots);
      return;
    }
  }
  tingbots.push({name: name, address: address});
  tingbotsEmitter.emit('refreshTingBots',tingbots);
}

setInterval(function() {
  console.log("I am doing my 5 minutes check for new tingbots");
  updateDNS();
}, the_interval);
updateDNS();

module.exports = tingbotsEmitter;
