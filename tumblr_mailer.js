var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");

var csvFile = fs.readFileSync("./friend_list.csv","utf8");

var emailTemplate = fs.readFileSync("./email_template.ejs", "utf8");

// Authenticate via OAuth
var client = tumblr.createClient({
	consumer_key: 'dOffu6lzJBWYtRMJNhAAevVeg5UvkIYPksaJCHcuPnqr3VT4yD',
	consumer_secret: 'ESgSo7TMH66wcVP8KSFDMIPxMneghyrFkkKJrwS0h2cFWNor8o',
	token: 'M4CcTmlhkwrkn4EOAgFXBY8eaEIkpDvk39JBpXM8G7WT6BPf1R',
	token_secret: 'pTNwbgpEeYkUfuiwQASlJDKxUm4nR10Du76PRUshXSf00xs7zN'
});

// parses CSV file and creates an array of contact objects
function csvParse(csvFile) {
	var csvArray = csvFile.split("\n");
	var keys = csvArray.shift().split(",");
	var contacts = csvArray;
	var resultArray = [];

	for(var i = 0; i < contacts.length; i++) {
		contacts[i] = contacts[i].split(",");
		var newPerson = {};
		for(var j = 0; j < keys.length; j++) {
			newPerson[keys[j]] = contacts[i][j];
		}
		newPerson["latestPosts"] = newPostsArray;
		resultArray.push(newPerson);
	}
	return resultArray;
}

var newPostsArray = [];
var contactObjectsArray = csvParse(csvFile);

//adds customized message attribute/property to each contact object in the array using EJS
client.posts("cde-v.tumblr.com", function(error, response) {
	for(var i = 0; i < response.posts.length; i++) {
		if( (Date.parse(response.posts[i].date)) > (Date.now()-(7*24*60*60*1000)) ) {
			newPostsArray.push(response.posts[i]);
		}
	}
	for(var i = 0; i < contactObjectsArray.length; i++) {
		contactObjectsArray[i]["latestPosts"] = newPostsArray;
		var emailMessage = ejs.render(emailTemplate, contactObjectsArray[i]);
		contactObjectsArray[i]["message"] = emailMessage;
		pretendThisEmails("cpdevill@gmail.com", contactObjectsArray[i]["emailAddress"], "", "New Blog Updates!", contactObjectsArray[i]["message"]);
	}
});

function pretendThisEmails(fromEmail, toEmail, ccEmail, subject, message) {
	console.log("\nFROM: " + fromEmail);
	console.log("TO: " + toEmail);
	console.log("CC: " + ccEmail);
	console.log("SUBJECT:" + subject +"\n");
	console.log(message);
}

/* (old code before implementing EJS)
//adds customized message attribute/property to each contact object in the array
var emailTemplate = fs.readFileSync("./email_template.html", "utf8");

function personalizeEmails(origEmailTemplate, arrayOfContactObjects) {
	var arrayOCO = arrayOfContactObjects;
	for(var i = 0; i < arrayOfContactObjects.length; i++) {
		var modEmailTemplate = origEmailTemplate;
		modEmailTemplate = modEmailTemplate.replace(/FIRST_NAME/, arrayOCO[i]["firstName"]);
		modEmailTemplate = modEmailTemplate.replace(/NUM_MONTHS_SINCE_CONTACT/, arrayOCO[i]["numMonthsSinceContact"]);
		arrayOCO[i]["message"] = modEmailTemplate;
	}
	return arrayOCO;
}

personalizeEmails(emailTemplate, csvParse(csvFile));
console.log(personalizeEmails(emailTemplate, csvParse(csvFile)));
*/

//CSV Format:
//firstName,lastName,numMonthsSinceContact,emailAddress
//Scott,D'Alessandro,0,scott@fullstackacademy.com