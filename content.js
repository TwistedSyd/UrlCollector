/* String splice function */
String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
/* Finds the nth instance of a substring */
function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}
/* Creates new tab and prints data out */
function printLinks(liveLinks, staticLinks, stagingLinks, oldStaticLinks, oldStagingLinks) {
  var myWindow = window.open("myWindow","newwin") 
  var page = '<b><h1>Live URLS:</h1></b><hr>';
  for(var i = 0; i < liveLinks.length; i++) {
    page += '<a target="_blank" href="' + liveLinks[i] + '">' + liveLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>***NEW*** Static URLS:</h1></b><hr>';
  for(var i = 0; i < staticLinks.length; i++) {
    page += '<a target="_blank" href="' + staticLinks[i] + '">' + staticLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>***NEW***Staging URLS:</h1></b><hr>';
  for(var i = 0; i < stagingLinks.length; i++) {
    page += '<a target="_blank" href="' + stagingLinks[i] + '">' + stagingLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>**OLD** Static URLS:</h1></b><hr>';
  for(var i = 0; i < oldStaticLinks.length; i++) {
    page += '<a target="_blank" href="' + oldStaticLinks[i] + '">' + oldStaticLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>**OLD** Staging URLS:</h1></b><hr>';
  for(var i = 0; i < oldStagingLinks.length; i++) {
    page += '<a target="_blank" href="' + oldStagingLinks[i] + '">' + oldStagingLinks[i] + '</a>' + '<br>';
  }
  var toPrint = page
  myWindow.document.write('<html><head><title>G5 Hub URLs</title></head><body>');
  myWindow.document.write('<p>' + toPrint+ '</p>');
}
/* Parse through hub .json file to get URLs */
function parseData(clientData) {
  var domainType = clientData.client.domain_type;
  var locations = clientData.client.locations;
  var liveLinks = [];
  var staticLinks = [];
  var stagingLinks = [];
  var oldStaticLinks = [];
  var oldStagingLinks = [];
  var link = '';
  var newLink = '';
  for(var i = 0; i < locations.length; i++) {
    if(locations[i].status != 'Deleted' && locations[i].status != 'Suspended'){
      if(domainType === 'SingleDomainClient') {
        link = locations[i].website_page_prefix;
      }
      if(domainType === 'MultiDomainClient') {
        link = locations[i].domain;
      }
      liveLinks.push(link);
      /* Remove 's'  and 'www.' from 'https://' for static and staging URLs */
      if(link[4] === 's') {
        link = link.splice(4, 1, '');
      }
      var positionSlash = getPosition(link, '/', 3);
      newLink = link.splice(positionSlash, 0, '.g5static.com');
      staticLinks.push(newLink);
      var positionDot = getPosition(link, '.', 2);
      newLink = link.splice(positionDot, 0, '-staging');
      positionSlash = getPosition(newLink, '/', 3);
      newLink = newLink.splice(positionSlash, 0, '.g5static.com');
      stagingLinks.push(newLink);

      /* Remove 's'  and 'www.' from 'https://' for static and staging URLs */
      if(link[4] === 's') {
        link = link.splice(4, 1, '');
        link = link.splice(7, 4, '');
      } else {
        link = link.splice(7, 4, '');
      }
      /* If link uses a top level domain other than '.com'
         remove and add .com accordingly */
      if(!link.includes('.com')) {
        var positionOne = link.indexOf('.');
        var positionTwo = getPosition(link, '/', 3);
        var difference = positionTwo - positionOne;
        link = link.splice(positionOne, difference, '');
        link = link.splice(positionOne, 0, '.com');
      }
      var position = link.indexOf('.');
      link = link.splice(position, 0, '.g5static'); 
      oldStaticLinks.push(link);
      position = link.indexOf('.');
      link = link.splice(position, 0, '-staging');
      oldStagingLinks.push(link);
    }
  }
  printLinks(liveLinks, staticLinks, stagingLinks, oldStaticLinks, oldStagingLinks); 
}
/* Fetches hub .json file */
async function getData(hubDomain) {
  var data = await(await fetch(hubDomain).then(function(response){
    /* If .json file is OK return, else return rejected promise */
    return response.ok ? response.json() : Promise.reject(response.status);
  }));
  return data;
}
/* Get page data to get .json file */
function getClientData() {
  /* Get .json file name */
  var hubDomain = document.URL;
  var position = hubDomain.indexOf('/admin');
  hubDomain = hubDomain.splice(position, 6, '') + '.json';

  getData(hubDomain)
    .then((clientData) => {
      parseData(clientData);
    })
    .catch((error) => {
      alert('There was an error fetching your hub data: ' + error);
    })
}
/* Receive message from popup.js */
chrome.runtime.onMessage.addListener(() => {
    getClientData();
});

