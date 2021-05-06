var cron = require('node-cron');
var shell = require('shelljs');

cron.schedule(' * * * * *', () => {
  console.log('Initiating Zelda Winner Announcement');
  if(shell.exec("node zelda.js").code !== 0){
      console.log("Zelda Winner Announcement failed");
  }
});