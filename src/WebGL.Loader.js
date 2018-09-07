/**
 * ! @extension WebGL.Loader
 * @param {*} url 
 * @param {*} callback 
 */
WebGL.Loader = function(wgl) {
  this.resource = null;  
  this.resCount = 0;
  return this;
}
WebGL.prototype.trypreload = function() {
  let timer = window.setInterval(function () {
    if (this.resCount <= 0) {
      let time = (performance.now() / 1000).toFixed(2);
      console.log('%cAll Resources Loaded in ' + time + 's', 'color : green');
      ((window.preload === undefined) ? this.preload : window.preload)();
      window.clearInterval(timer);
      return;
    }
  }.bind(this), 10);
}
WebGL.Loader.prototype.load = function(type, url) {
  let that = this;
  if (type === 'IMAGE') {
    that.resCount++;
    wgl.loadImage(url, function (err, img) {
      if (err) return;
      if (img) {
        that.resource = img;
        that.resCount--;
      }
    });
  } else if (type === 'MODEL') {
    wgl.loadModel(url, function (err, data) {
      if (err) return;
      if (data) {
        that.resource = data;
      }
    });
  }
  
  let timer = window.setInterval(function () {
    if (this.resCount <= 0) {
      let time = (performance.now() / 1000).toFixed(2);
      console.log('%cAll Resources Loaded in ' + time + 's', 'color : green');
      ((window.preload === undefined) ? this.preload : window.preload)();
      window.clearInterval(timer);
      return;
    }
  }.bind(this), 10);
  return this;
}

WebGL.prototype.loadFile = function (url, callback) {
  this.res++;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true)
  xhr.onload = function () {
    if (xhr.status === 200 && xhr.readyState === 4) {
      this.res--;
      callback(null, xhr.responseText);
    } else {
      callback('Error Loading File', null);
    }
  }.bind(this);

  xhr.send();
}

WebGL.prototype.loadModel = function (url, callback) {
  this.res++;
  this.loadFile(url, function (err, data) {
    if (err) {
      callback('Error Loading Model', null);
    } else {
      this.res--;
      callback(null, JSON.parse(data));
    }
  }.bind(this));
}

WebGL.prototype.loadImage = function (url, callback) {
  this.res++;
  let img = new Image();
  img.onerror = function () {
    console.warn('Error Loading Image Texture');
    return;
  }
  img.onload = function () {
    this.res--;
    callback(null, img);
  }.bind(this);
  img.src = url;
}

WebGL.prototype.loadVideo = function (url, callback) {
  this.res++;
  let vid = document.createElement('video');
  let playing = false;
  let timeupdate = false;

  vid.autoplay = true;
  vid.muted = true;
  vid.loop = true;

  vid.onerror = function () {
    console.warn('Error Loading Image Texture');
    return;
  }

  vid.addEventListener('playing', function () {
    playing = true;
    checkReady();
  }.bind(this), true);
  
  vid.addEventListener('timeupdate', function () {
    timeupdate = true;
    checkReady();
  }, true);
  

  vid.src = url;
  vid.play();
  
  this.res--;
  function checkReady() {
    if (playing && timeupdate) {
      this.videoloaded = true;
    }
  }
  callback(null, vid);
  // return vid;


  // vid.onloadstart = function () {
  //   this.res--;
  //   callback(null, vid);
  // }.bind(this);
  // vid.src = url;
}