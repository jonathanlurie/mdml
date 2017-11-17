importScripts('showdown.min.js');

onmessage = function(e) {
  //importScripts('showdown.min.js');

  var mdString = e.data;

  var converter = new showdown.Converter();
  var htmlOutput = converter.makeHtml(mdString);

  // send back the data to the main thread
  postMessage(htmlOutput);



}
