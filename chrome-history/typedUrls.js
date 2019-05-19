var arr=[];
function onAnchorClick(event) {
    chrome.tabs.create({
      selected: true,
      url: event.srcElement.href
    });
    
    return false;
  }
  
  // browser action popup.
  function buildPopupDom(divName, data) {
    /*var popupDiv = document.getElementById(divName);
    var ul = document.createElement('ul');
    popupDiv.appendChild(ul);
    for (var i = 0, ie = data.length; i < ie; ++i) {
      var a = document.createElement('a');
      a.href = data[i];
      a.appendChild(document.createTextNode(data[i]));
      a.addEventListener('click', onAnchorClick);
      var li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
    }*/
    arr=data;
/*    var a = document.createElement('a');
      a.href = chrome.runtime.getURL("my_url.html")
      a.appendChild(document.createTextNode(chrome.runtime.getURL("my_url.html")));
      a.addEventListener('click', onAnchorClick);
      var li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
    
    
    chrome.tabs.create({
    url: chrome.runtime.getURL("my_url.html")
  }, function(tab) {
    window.document.body.style.backgroundColor = "green";
  });*/
  fetch("http://localhost:3000/ac/bd", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  
    //make sure to serialize your JSON body
    body: JSON.stringify({
      url: arr,
      getid:1007
    })
  })
  .then( (response) => { 
     response.text()
  })
  .then( json => console.log(json));
  }
  // Search history to find up to fifty links that a user has typed in,
  // and show those links in a popup.
  function buildTypedUrlList(divName) {
    // To look for history items visited in the last week,
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
    // Track the number of callbacks from chrome.history.getVisits()
    var numRequestsOutstanding = 0;
    chrome.history.search({
        'text': '',              // Return every history item....
        'startTime': oneWeekAgo  // that was accessed less than one week ago.
      },
      function(historyItems) {
        // For each history item, get details on all visits.
        for (var i = 0; i < historyItems.length; ++i) {
          var url = historyItems[i].url;
          var processVisitsWithUrl = function(url) {
            // We need the url of the visited item to process the visit.
            // Use a closure to bind the  url into the callback's args.
            return function(visitItems) {
              processVisits(url, visitItems);
            };
          };
          chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
          numRequestsOutstanding++;
        }
        if (!numRequestsOutstanding) {
          onAllVisitsProcessed();
        }
      });
    // Maps URLs to a count of the number of times the user typed that url
    var urlToCount = {};
    // Counts the number of
    // times a user visited a URL by typing the address.
    var processVisits = function(url, visitItems) {
      for (var i = 0, ie = visitItems.length; i < ie; ++i) {
        
        
        if (!urlToCount[url]) {
          urlToCount[url] = 0;
        }
        urlToCount[url]++;
      }
      // If this is the final outstanding call to processVisits(),
      // then we have the final results.  Use them to build the list
      // of URLs to show in the popup.
      if (!--numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    };
    // This function is called when we have the final list of URls to display.
    var onAllVisitsProcessed = function() {
      // Get the recent urls.
      urlArray = [];
      for (var url in urlToCount) {
        urlArray.push(url);
      }
      
      buildPopupDom(divName, urlArray.slice(0, 10));
    };
  }
  document.addEventListener('DOMContentLoaded', function () {
    buildTypedUrlList("typedUrl_div");
  });

  //var r=['www.google.com','www.soal.io'];
  
  
  
