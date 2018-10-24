var setZoom;

function createMap() {
  var navMap = {};
  var routes = {};
  var scale = 1;
  var height = 5;
  var angleOffset = -90;
  var minSpeed = 10;
  var xOffset = 0;
  var yOffset = 0;
  var carPosition = new THREE.Vector3();
  var carHeading = new THREE.Vector3();
  var scene = new THREE.Scene();
  var zoomedOut = false;
  var zoomedDistance = 1500;

  var infoScene = new THREE.Scene();

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  var mapFile;
  var carTexture = THREE.ImageUtils.loadTexture('/img/car-icon.png');
  var carMaterial = new THREE.MeshBasicMaterial({
    map: carTexture,
    transparent: true,
    wireframe: false
  });
  var cube = new THREE.Mesh(new THREE.PlaneGeometry(137, 197), carMaterial);

  var clickableObjects = [];

  var anchorPointAngleMap = {};
  anchorPointAngleMap['upperLeft'] = -45;
  anchorPointAngleMap['upperRight'] = 45;
  anchorPointAngleMap['bottom'] = 180;

  navMap.hide = function(obj) {
    console.log('Hiding ' + obj);
    obj.visible = false;
    obj.scale = {
      x: 0.00001,
      y: 0.00001,
      z: 0.00001
    };
  };

  navMap.setCameraLow = function() {
    navMap.cameraHeightMultiplier = 50;
  };

  navMap.setCameraHigh = function() {
    navMap.cameraHeightMultiplier = 100;
  };

  var render = function(data) {
    if (!navMap.renderer) {
      initializeMap(data);
    } else {
      renderExistingMap(data);
    }
  };

  function renderExistingMap(data) {
    var parent = $("#" + data.quadrant);
    var $navMap = $("<div id='navMap'></div>");
    $navMap.append(navMap.renderer.domElement);
    parent.empty().html($navMap);
  }

  var loadedCount = 0;
  function onMapLoaded(name, result) {
    var route = result.scene;
    route.scale.x = route.scale.y = route.scale.z = scale;
    route.position = new THREE.Vector3();
    route.visible = false;
    route.name = name;
    routes[name] = route;
    if (++loadedCount === mapFiles.length) {
        showMap("map1");
    }

  }

  function initializeMap(data) {
    var parent = $("#" + data.quadrant);
    var $navMap = $("<div id='navMap'></div>");
    var VIEW_ANGLE = 45,
      ASPECT = parent.width() / parent.height(),
      NEAR = 0.1,
      FAR = 1000000;

    navMap.renderer = new THREE.WebGLRenderer();
    navMap.renderer.autoClear = false;
    navMap.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    navMap.renderer.setSize(parent.width(), parent.height());

    navMap.scene = scene;

    //append map to parent
    $navMap.append(navMap.renderer.domElement);
    parent.empty().html($navMap);

    directionalLight.position.set(0.7, 1, 0.3).normalize();
    scene.add(directionalLight);
    navMap.cameraHeightMultiplier = 50;
    navMap.setCameraLow();
    navMap.loader = new THREE.ColladaLoader();

    mapFiles = [{
      name: "map2",
      url: "/maps/map_LongRoute.dae"
    }, {
      name: "map1",
      url: "/maps/map_ShortRoute.dae"
    }, {
      name: "mapChoice",
      url: "/maps/map_BothRoutes.dae"
    }];

    mapFiles.forEach(function(mapFile) {
      navMap.loader.load(mapFile.url, onMapLoaded.bind(null, mapFile.name));
    });

    function animate() {
      navMap.renderer.clear();
      navMap.renderer.render(scene, navMap.camera);
      navMap.renderer.clear(false, true, true); //clear everything except the color buffer
      requestAnimationFrame(animate);
    }

    //new cube - this is the car
    cube.position = {
      x: 0,
      y: 1,
      z: 0
    };
    cube.scale = {
      x: 0.1,
      y: 0.1,
      z: 0.1
    };
    cube.lookAt({
      x: 0,
      z: 50,
      y: 50
    });
    scene.add(cube);


    navMap.camera.position.y = zoomedOut ? zoomedDistance : height * navMap.cameraHeightMultiplier; //orig 50

    navMap.camera.lookAt(carHeading);
    animate();
  }

  function updateCarPosition(data) {
    // console.log('navMap Telemetry received');
    if (!navMap.camera) {
      console.log("No camera exists.");
      return;
    }

    var phase = ((parseFloat(data.heading) - angleOffset) / 360) * 2 * Math.PI;

    data = data.value ? jQuery.parseJSON(data.value) : data;
    carPosition.x = -data.location.x * scale + xOffset;
    carPosition.z = data.location.y * scale + yOffset;
    carPosition.y = height;

    //carHeading is a point right in front of the car, in the direction the car is moving
    carHeading.x = navMap.camera.position.x + Math.cos(phase) * 10;
    carHeading.z = navMap.camera.position.z + Math.sin(phase) * 10;
    carHeading.y = height;

    navMap.camera.position = carPosition;

    var cameraType = 'overhead'; //first, third, overhead
    //first person
    if (cameraType === 'first') {
      //noop
    } else if (cameraType === 'third') {
      //a little bit up, and a little bit back
      var chaseDistance = 10;
      navMap.camera.position.x -= chaseDistance * Math.cos(phase);
      navMap.camera.position.z -= chaseDistance * Math.sin(phase);
      navMap.camera.position.y = chaseDistance / 2;
    } else { //overhead
      navMap.camera.position.y = height * navMap.cameraHeightMultiplier;
      //console.log('mph: '+data.mph);
      if (data.mph > minSpeed) {
        var extraHeight = zoomedDistance ? 3000 : (height * 2) * (data.mph - minSpeed);
        navMap.camera.position.y += extraHeight;
        //console.log('Adding height '+extraHeight);
      }
    }
    navMap.camera.lookAt(carHeading);

    //update car marker
    cube.position = carHeading;
    cube.position.y = 2 * height;

    cube.lookAt({
      x: cube.position.x - Math.cos(phase),
      y: cube.position.y + 2000,
      z: cube.position.z - Math.sin(phase)
    });
  }

  function removeNavMap(data) {
    $("#navMap").parent().empty();
  }

  function showMap(name) {
    console.log("Requested to show map:", name);
    for (var key in routes) {
      var route = routes[key];
      if (key === name) {
        scene.add(route);
      } else {
        scene.remove(route);
      }
    }

    navMap.renderer.render(navMap.scene, navMap.camera);
  }

  setZoom = function(value) {
    zoomedOut = true;
    zoomedDistance = value;
    navMap.renderer.render(navMap.scene, navMap.camera);
    setTimeout(zoomIn, 2000);
  };

  function zoomOut(duration) {
    console.log("Zooming out for " + duration + "ms");
    zoomedOut = true;
    navMap.renderer.render(navMap.scene, navMap.camera);
    if (duration) {
        setTimeout(zoomIn, duration);
    }
  }

  function zoomIn() {
    zoomedOut = false;
    navMap.renderer.render(navMap.scene, navMap.camera);
  }

  return {
    render: render,
    showMap: showMap,
    updateCarPosition: updateCarPosition,
    zoomIn: zoomIn,
    zoomOut: zoomOut
  };
}
