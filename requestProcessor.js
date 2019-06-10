var method = RequestProcessor.prototype;

const debug = require('debug')('RequestProcessor');
const name = 'RequestProcessor';
debug('Booting %s', name);
const https = require('https');
const externalDictionary = require("./externalDictionary.js");
const utilTools = require("./utilTools.js");
const resultReplacementHandle = '#result_attachment_handle#';


var extDictFacadeObject = new externalDictionary(https);	
var utilFacadeObject = new utilTools();

const resultHTMLRawData = utilFacadeObject.readFromFile(__dirname + '/frontend/result.html').toString('utf8');


function RequestProcessor(req, res) {
    
	this.request = req;
	this.response = res;

}

method.serveHome = function () {

	debug('Get request on /')
	this.response.statusCode = 200;
	this.response.setHeader('Content-Type', 'text/html');
	var HTMLRawData = resultHTMLRawData.replace(resultReplacementHandle,"");
	this.response.write(HTMLRawData);
	this.response.end();
	
	//this.response.sendFile(__dirname + '/frontend/index.html');
	debug('Response (HTML Page) sent back to server');
	
};

method.serveTestPage = function () {
	
	debug('Get request on /test')
	this.response.statusCode = 200;
	this.response.sendFile(__dirname + '/frontend/index_test.html');
	debug('Response (HTML Page) sent back to server');

};

method.serveGetRequestForAllWordsWithPrefix = function (prefix, lclDictFacadeObject) {
	
	debug('Get request on /wordsForPrefix with prefix - ' + prefix);
	this.response.statusCode = 200;
	this.response.setHeader('Content-Type', 'application/json');
	listOfWords = lclDictFacadeObject.getAuto(prefix, null, null, null);
	if (listOfWords != -1) {
		var generatedResponse = {}
		generatedResponse['responseCode'] = 0
		generatedResponse['list'] = listOfWords
		this.response.send(generatedResponse);	
	}
	else {
		var generatedResponse = {}
		generatedResponse['responseCode'] = -1
		generatedResponse['list'] = []
		this.response.send(generatedResponse);		
	}
	this.response.end();
	
};

method.serveSearchQuery = function (lclDictFacadeObject) {
	
	debug('Post request on /search')
	var word = "";
	var currentContextObj = this;
	this.request.on('data',function (data) {
	word = word + data;
	try {
		word = word.split("=")[1].toLowerCase();
	}
	catch(err) {
		word = JSON.parse(word).search;
	}
	debug('Argument from request - ' + word);
	
	var meaning = lclDictFacadeObject.get(word);
	
	if (meaning == -1) {
	
		debug('Calling extDictFacadeObject.getMeaning for word - ' + word)
		var operationOutput = extDictFacadeObject.getMeaning(word, function(data) {
		debug('Response received from extDictFacadeObject.getMeaning for word - ' + word + ' is - ' + data);
		
		currentContextObj.response.statusCode = 200;
		currentContextObj.response.setHeader('Content-Type', 'text/html');
		if(data != null && data!= -1) {
			lclDictFacadeObject.put(word, data);
			var formulatedResultHTMLData = utilFacadeObject.formulateResultForHTMLPage(word.charAt(0).toUpperCase() + word.toLowerCase().slice(1), data);
			resultHTMLRawDataWithResult = resultHTMLRawData.replace(resultReplacementHandle,formulatedResultHTMLData);
			currentContextObj.response.write(resultHTMLRawDataWithResult);
		}
		else {
			
			if(data == -1) {
					var formulatedResultHTMLData = utilFacadeObject.formulateResultForHTMLPage(word.charAt(0).toUpperCase() + word.toLowerCase().slice(1), -1);
					resultHTMLRawDataWithResult = resultHTMLRawData.replace(resultReplacementHandle,formulatedResultHTMLData);
					currentContextObj.response.write(resultHTMLRawDataWithResult);
			}
			else {
				currentContextObj.response.statusCode = 200;
				currentContextObj.response.setHeader('Content-Type', 'text/html');
				currentContextObj.response.write(resultHTMLRawData);
			}
		}
		
		currentContextObj.response.end();
		
		});
	}
	else {
		
		debug('Recieved meaning for word - ' + word + ' from lclDictFacadeObject.getMeaning')
		currentContextObj.response.statusCode = 200;
		currentContextObj.response.setHeader('Content-Type', 'text/html');
		if(meaning != null) {
			var formulatedResultHTMLData = utilFacadeObject.formulateResultForHTMLPage(word.charAt(0).toUpperCase() + word.toLowerCase().slice(1), meaning);
			resultHTMLRawDataWithResult = resultHTMLRawData.replace(resultReplacementHandle,formulatedResultHTMLData);
			currentContextObj.response.write(resultHTMLRawDataWithResult);
		}
		else {
			currentContextObj.response.statusCode = 200;
			currentContextObj.response.setHeader('Content-Type', 'text/html');
			currentContextObj.response.write(resultHTMLRawData);
		}
		
		currentContextObj.response.end();
		
	}
	
	
		
	debug('Response sent back to server');
});

}

module.exports = RequestProcessor;
