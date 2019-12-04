/* String splice function */
String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
/* Creates new tab and prints data out */
function printLinks(liveLinks, staticLinks, stagingLinks) {
  let myWindow = window.open("myWindow","newwin") 
  let page = '<b><h1>Live URLS:</h1></b><hr>';
  for(let i = 0; i < liveLinks.length; i++) {
    page += '<a target="_blank" href="' + liveLinks[i] + '">' + liveLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>Static URLS:</h1></b><hr>';
  for(let i = 0; i < staticLinks.length; i++) {
    page += '<a target="_blank" href="' + staticLinks[i] + '">' + staticLinks[i] + '</a>' + '<br>';
  }
  page += '<b><h1>Staging URLS:</h1></b><hr>';
  for(let i = 0; i < stagingLinks.length; i++) {
    page += '<a target="_blank" href="' + stagingLinks[i] + '">' + stagingLinks[i] + '</a>' + '<br>';
  }
  let toPrint = page
  myWindow.document.write('<html><head><title>G5 Hub URLs</title></head><body>');
  myWindow.document.write('<p>' + toPrint+ '</p>');
}
/* Parse through hub .json file to get URLs */
function parseData(clientData) {
  let domainType = clientData.client.domain_type;
  let locations = clientData.client.locations;
  let liveLinks = [];
  let staticLinks = [];
  let stagingLinks = [];
  let link = ''

  for(let i = 0; i < locations.length; i++) {
    if(locations[i].status != 'Deleted' && locations[i].status != 'Suspended'){
      if(domainType === 'SingleDomainClient') {
        link = locations[i].website_page_prefix;
      }
      if(domainType === 'MultiDomainClient') {
        link = locations[i].domain;
      }
      liveLinks.push(link);
      /* Remove 's' from 'https://' for static and staging URLs */
      if(link[4] === 's') {
        link = link.splice(4, 1, '');
        link = link.splice(7, 4, '');
      } else {
        link = link.splice(7, 4, '');
      }
      let position = link.indexOf('.');
      link = link.splice(position, 0, '.g5static'); 
      staticLinks.push(link);
      position = link.indexOf('.');
      link = link.splice(position, 0, '-staging');
      stagingLinks.push(link);
    }
  }
  printLinks(liveLinks, staticLinks, stagingLinks); 
}
/* Fetches hub .json file */
async function getData(hubDomain) {
  let data = await(await fetch(hubDomain).then(function(response){
    /* If .json file is OK return, else return rejected promise */
    return response.ok ? response.json() : Promise.reject(response.status);
  }));
  return data;
}
/* Get page data to get .json file */
function getClientData() {
  /* Get .json file name */
  let hubDomain = document.URL;
  let position = hubDomain.indexOf('/admin');
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

