var method = ExternalDictionary.prototype;

const apiHost = "od-api.oxforddictionaries.com";
const pathPrefix = "/api/v1/entries/en/";
const pathSuffix = "?fields=definitions&strictMatch=false";
const port = "443";
const requestMethod = "GET";
const rejectUnauthorized = false;
const appId = "b2abd307";
const appKey = "df80177b777284557033fb501f5e0c96";
const debug = require('debug')('ExternalDictionary')
const name = 'External Dictionary'
debug('Booting %s', name)


function ExternalDictionary(httpsFacade) {
    this.dictionaryFacade = {
		 host: apiHost,
		 path: null,
		 port: port,
		 method: requestMethod,
		 headers: null
		};
	this.https = httpsFacade;
}

method.getMeaning = function(word, callback) {
	
	if (verifyInput(word)) {
	
		formulatedPath = ''.concat(pathPrefix + word.toLowerCase() + pathSuffix)
		formulatedHeaders = {
		  'app_id': appId,
		  'app_key': appKey
		}
		getRequest = this.dictionaryFacade
		getRequest["path"] = formulatedPath
		getRequest["headers"] = formulatedHeaders
		debug('Formulated GET request is - ' + getRequest)
		
		this.https.get(getRequest, function(response) {
			let body = '';
			response.on('data', function(data) {
				body = body + data;
			});
			response.on('end', () => {
				if (body.includes("<h1>Not Found</h1>")) {
					callback(-1);
					return
				}
				let parsed = JSON.parse(body);
				debug('Response recieved from API - ' + body);
				var definitions = []
				for (var l = 0; l < parsed.results.length; l++) {
					for (var i = 0; i < parsed.results[l].lexicalEntries.length; i++) {
						for (var j = 0; j < parsed.results[l].lexicalEntries[i].entries.length; j++) {
							for (var k = 0; k < parsed.results[l].lexicalEntries[i].entries[j].senses.length; k++) {
								if (parsed.results[l].lexicalEntries[i].entries[j].senses[k].definitions) {
									var def = parsed.results[l].lexicalEntries[i].entries[j].senses[k].definitions[0];
								}
								else {
									continue;
								}
								var exa = "";
								var lexCat = parsed.results[l].lexicalEntries[i].lexicalCategory
								if (parsed.results[l].lexicalEntries[i].entries[j].senses[k].examples) {
									exa = parsed.results[l].lexicalEntries[i].entries[j].senses[k].examples[0].text;
									var defExaObj = {'definition':def, 'example':exa, 'lexical_category':lexCat};
								}
								else {
									exa = null;
									var defExaObj = {'definition':def, 'lexical_category':lexCat};
								}
								definitions.push(defExaObj)
							}
						}
					}
				}
				callback(definitions);
				//callback(body);
			});
		});
	}
};

function verifyInput(input) {
	// to-do code to verify the input doesnt contain numbers 
	
	var letters = /^[A-Za-z]+$/;
	if(input.match(letters)) {
		return true;
	}
	else {
		debug('Please input alphabet characters only');
		return false;
	}
}

module.exports = ExternalDictionary;