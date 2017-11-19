
  var md = document.getElementById("md");
  var ht = document.getElementById("ht");
  var rt = document.getElementById("rt");
  var rtContainer = document.getElementById("rtContainer");
  var enableRichBt = document.getElementById("enableRichBt");
  var enableHtmlBt = document.getElementById("enableHtmlBt");
  var perf = document.getElementById("perf");
  var downloadBt = document.getElementById("downloadBt");
  var fileInput = document.createElement('input');
  fileInput.type = "file";
  var openFileBt = document.getElementById("openFileBt");
  var eraseBt = document.getElementById("eraseBt");
  var fullscreenBt = document.getElementById("fullscreenBt");

  var content = {
    md: "",
    html: ""
  }

  var lastCharTime = 0;
  var typeWaitMs = 300;
  var hasNewChar = false;
  var timeSent = 0;
  var timeReceived = 0;
  var convertInvervalMs = 20;

  var myWorker = new Worker("js/converter.js");

  md.addEventListener("keyup", function(e){
    hasNewChar = true;
    lastCharTime = performance.now();
  });

  md.addEventListener("keydown", function(e){
    perf.innerHTML = "..."
  });

  window.setInterval(function(){
    var now = performance.now();

    if( hasNewChar && (now - lastCharTime > typeWaitMs) ){
      launchConvert();
      hasNewChar = false;
      saveToLocalStorage();
    }

  }, convertInvervalMs);

  myWorker.onmessage = function(e){
    timeReceived = performance.now();
    convertInvervalMs = Math.round(timeReceived - timeSent);
    perf.innerHTML = convertInvervalMs + "ms";
    content.html = e.data;
    ht.value = content.html;
    rt.innerHTML = content.html;
    mimicScroll();
  }

  fileInput.addEventListener("change", function(e){
    var files = e.target.files;
    console.log( files );

    if( !files )
      return;

    var reader = new FileReader();
    reader.onloadend = function(e){
      hasNewChar = true;
      var result = event.target.result;
      md.value = result;
      launchConvert();
    }
    reader.readAsText( files[0] );
  });

  openFileBt.addEventListener("mouseup", function(e){
    fileInput.click();
  });



  function launchConvert(){
    console.log("Convert!");
    content.md = md.value;
    timeSent = performance.now();
    myWorker.postMessage( content.md );
  }

  /*
  window.setInterval(function(){
    mimicScroll();

  }, 10);
  */

  function mimicScroll(){

    var scrollPercentageMd = md.scrollTop / (md.scrollHeight - md.clientHeight);

    if( scrollPercentageMd > 0.95 ){
      ht.scrollTop = ht.scrollHeight
      rtContainer.scrollTop = rtContainer.scrollHeight
    }else if( scrollPercentageMd < 0.05 ){
      ht.scrollTop = 0;
      rtContainer.scrollTop = 0
    }

    //console.log( scrollPercentageMd );
    //ht.scrollTop = ht.scrollHeight * scrollPercentageMd;
    //console.log( scrollPercentageMd);
  }


  enableRichBt.addEventListener("mouseup", function(e){
    enableRich();
  });


  enableHtmlBt.addEventListener("mouseup", function(e){
    enableHtml();
  });

  downloadBt.addEventListener("mouseup", function(e){
    download();
  });


  eraseBt.addEventListener("mouseup", function(e){
    md.value = "";
    launchConvert();
  });

  function enableHtml(){
    enableRichBt.className = "bubbleButton";
    enableHtmlBt.className = "bubbleButton bubbleButtonSelected";

    rtContainer.style.display = "none";
    ht.style.display = "initial";
  }


  function enableRich(){
    enableRichBt.className = "bubbleButton bubbleButtonSelected";
    enableHtmlBt.className = "bubbleButton";

    rtContainer.style.display = "initial";
    ht.style.display = "none";
  }


  fullscreenBt.addEventListener('mouseup', function() {
    if (screenfull.enabled) {
      if(screenfull.isFullscreen){
        screenfull.exit();
      }else{
        screenfull.request();
      }
    }
  });

  function saveToLocalStorage( name="default" ){
    if (typeof(Storage) === "undefined")
      return;

    localStorage[ name ] = content.md;
  }

  function loadFromLocalStorage( name="default"){
    if (typeof(Storage) === "undefined")
      return;

    if( name in localStorage ){
      md.value = localStorage[ name ];
      launchConvert();
    }
  }


  function download( ){
    _downloadText( content.html, "content.html", "text/html" );
    _downloadText( content.md, "content.md", "text/markdown" );
  }

  function _downloadText( textContent, filename, mime="text/plain" ){
    var link = document.createElement('a');//document.getElementById("downloadLink");
    //link.style.display = "none";
    var blob = new Blob([textContent], {type: "text/html"});
    // type for md is "text/markdown"
    var url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
  }


  loadFromLocalStorage();
