var storage = require('azure-storage')
  , config = require('./config')
  , storageName = config.connection.storageName
  , storageKey = config.connection.storageKey


if (process.argv.length <= 3) {
    console.log("Usage: queuedemo <queuename> <numMessagesToRead>");
    process.exit(-1);
}
var queueName = process.argv[2];
var messagesToRead = process.argv[3];

var connectionString = 'DefaultEndpointsProtocol=https;AccountName=' + storageName + ';AccountKey=' + storageKey;
var queueService = storage.createQueueService(connectionString);

queueService.createQueueIfNotExists(queueName, function(error, result, response){
  if(!error){
    console.log('queue already exists');
  }
});


queueService.createMessage(queueName, 'sample message 123', function() {
	console.log('message added');
});
queueService.createMessage(queueName, 'sample message 456', function() {
	console.log('message added');
});
console.log('attempting to read message:')
 
queueService.getMessages(queueName, {numOfMessages: messagesToRead, useNagleAlgorithm: false}, function(error, serverMessages) {
	if(!error) {
		console.log('total of ' + serverMessages.length + ' messages returned.');
		for(var i=0; i < serverMessages.length; i++) {
			console.log('message: ' + serverMessages[i].messagetext);
			if(i === 0) {
				queueService.updateMessage(queueName, serverMessages[i].messageid, serverMessages[i].popreceipt, 5, {messageText: serverMessages[i].messagetext + '(modified)'}, function(error) {
					if(!error){
	   					console.log('modified message.');
					}
				} );
			}
			else {

				queueService.deleteMessage(queueName, serverMessages[i].messageid, serverMessages[i].popreceipt, function(error) {
					if(!error){
	   					console.log('deleted message.');
					}
	 			});
			}
		};
	}
});
