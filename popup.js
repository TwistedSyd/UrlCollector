let getURL = document.getElementById('getURL');
var selectedVertical = 'none';
/* Listen for Get URL button to be clicked, 
   when clicked send message to content.js */
getURL.addEventListener('click', (event) => {
  const params = {
    active: true, 
    currentWindow: true
  }
  chrome.tabs.query(params, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {text: "get_url"});
  });
});