//==============================================================================
// Author: Nergal
// Date: 2014-06-12
//==============================================================================
"use strict";

function Object3D() {
    // THREE.Mesh.apply(this, arguments); inherite from mesh
    this.mesh;
    this.uniforms;
    this.attributes;
    this.time;
    this.remove = 0;
    this.meshes = new Array();

    Object3D.prototype.Die = function() {
    };

    Object3D.prototype.Hit = function() {
    };

    Object3D.prototype.GetObject = function() {
	return this.mesh;
    };

    Object3D.prototype.Draw = function() {

    };
    
    Object3D.prototype.AddToScene = function(scene) {
	scene.add(this.mesh);
    };
}


/////////////////////////////////////////////////////////////
// Sun
/////////////////////////////////////////////////////////////
function Sun() {
    Object3D.call(this);
    this.renderer = 0;
    this.skycolor = 0;

    Sun.prototype.Create = function(x, y, z, scene, renderer) {
	this.renderer = renderer;
	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(0, 0, 0);
	scene.add(lightTarget);
	var spotlight = new THREE.SpotLight(0xffffff);
	spotlight.position.set(0, 6500, 0);
	spotlight.shadowCameraVisible = false; //true;
	spotlight.shadowDarkness = 0.65; // 0.35
	spotlight.shadowCameraNear = 3000;
	spotlight.shadowCameraFar = 10000;
	spotlight.intensity = 1.7; // 0.5; day = 1.9
	//spotlight.castShadow = true;
	spotlight.shadowMapHeight =  1024;
	spotlight.shadowMapWidth = 1024;
	spotlight.target = lightTarget;
	this.light = spotlight;
	scene.add(spotlight);
	
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.2, 1, 0.2 );
	hemiLight.groundColor.setHSL( 1, 1, 1 );
	hemiLight.position.set( 0, 1000, 0 );
	hemiLight.intensity = 0.7; // 0.06 day = 1.0
	
	// Without draw
	this.skycolor = 255; // day = 255
	this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
	scene.fog = new THREE.Fog(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1000, 3000 );
	
	scene.add( hemiLight );
	this.hemiLight = hemiLight;

	var customMaterial = new THREE.ShaderMaterial( 
	    {
		uniforms: {  },
//		vertexShader:   document.getElementById( 'sunVertexShader'   ).textContent,
//		fragmentShader: document.getElementById( 'sunFragmentShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	    }   );

    };


    Sun.prototype.Draw = function(time, delta) {
	var e_angle = 0.01 * time * 0.1;
	this.light.position.set(6500* Math.cos(e_angle), 6500* Math.sin(e_angle)-1000, 0); // 6500

	if(this.light.position.y > -500 && this.light.position.x > 0) {
	    if(this.skycolor < 254) {
		this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
		scene.fog = new THREE.FogExp2(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 0.00015 );
		this.skycolor += 1;
	    }

	    if(this.hemiLight.intensity < 0.6) {
		this.hemiLight.intensity += 0.001;
	    }
	    if(this.light.intensity < 1.5) {
		this.light.intensity += 0.001;
	    }
	}
	if(this.light.position.y < 300 && this.light.position.x < 0) {	
	    if(this.skycolor > 1) {
		this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
		scene.fog = new THREE.FogExp2(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 0.00025 );
		this.skycolor -= 1;
	    }
	    if(this.hemiLight.intensity > 0.05) {
		this.hemiLight.intensity -= 0.001;
	    }
	    if(this.light.intensity > 0.005) {
		this.light.intensity -= 0.001;
	    }
	}
	if(this.light.position.z > 5000) {
	    this.light.position.z = -5000;
	    this.mesh.position.z = -5000;
	}
    };
}
Sun.prototype = new Object3D();
Sun.prototype.constructor = Sun;

/////////////////////////////////////////////////////////////
// Water
/////////////////////////////////////////////////////////////
function Water() {
    Object3D.call(this);
    this.type = "water";

    Water.prototype.Create = function(scene) {
	var geometry = new THREE.PlaneGeometry( 5500, 5500, 128 - 1, 128 - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	geometry.dynamic = true;
	
	var i, j, il, jl;
	for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
	    geometry.vertices[ i ].y = 35 * Math.sin( i/2 );
	}
	
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var texture2 = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
	texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
	texture2.repeat.set( 1,1 );
	
	// two types of water
	var material2 = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture2, transparent: true, opacity: 0.6} );
	var mesh = new THREE.Mesh(geometry, material2);
	mesh.position.set(0,100,0);
	mesh.that = this;
	game.targets.push(mesh);
	
	// add black ocean bottom

	var oceanTexture  = new THREE.ImageUtils.loadTexture( 'textures/sand-512.jpg' );
	oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping; 
	oceanTexture.repeat.set( 8, 8 );
	var bottom_geo = new THREE.PlaneGeometry( 10000, 7000 );
	var bottom_mat = new THREE.MeshBasicMaterial( {  map: oceanTexture, transparent: false, opacity: 1} );
	var bottom = new THREE.Mesh(bottom_geo, bottom_mat);
	bottom.position.set(0, -200, 0);
	bottom.rotation.x = -Math.PI/2;

	scene.add(bottom);

	this.mesh = mesh;
	game.scene.add(this.mesh);
    };

    Water.prototype.Draw = function(time, delta, index) {
	for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
	    this.mesh.geometry.vertices[ i ].y = 3.1 * Math.sin( i / 10 + ( time + i ) / 7 );    
	    this.mesh.geometry.vertices[ i ].y += 1.8 * Math.sin( i / 10 + ( time + i ) / 4 );
	}
	this.mesh.geometry.verticesNeedUpdate = true;
    };
}
Water.prototype = new Object3D();
Water.prototype.constructor = Water;

/////////////////////////////////////////////////////////////
// Fish
/////////////////////////////////////////////////////////////
function Fish() {
    Object3D.call(this);
    this.pos_x_t = 0;
    this.pos_y_t = 0;
    this.pos_z_t = 0;
    this.name = "Fish";
    this.speed = 100+Math.random()*200;

    Fish.prototype.Spawn = function(args) {
	this.scale = args.scale;
	this.max_speed = args.max_speed;
	this.boundary_maxx = args.boundary_maxx;
	this.boundary_minx = args.boundary_minx;
	this.boundary_miny = args.boundary_miny;
	this.boundary_maxy = args.boundary_maxy;
	this.boundary_minz = args.boundary_minz;
	this.boundary_maxz = args.boundary_maxz;
	var object = game.modelLoader.GetModel('fish'+args.type);


	this.pos_x = args.x;
	this.pos_z = args.z;
	this.pos_y = args.y;
	object.scale.set(this.scale,this.scale,this.scale);
	object.position.set(this.pos_x, this.pos_y, this.pos_z);
	this.mesh = object;
	game.scene.add(this.mesh);
    };

    Fish.prototype.Draw = function(time, delta, index) {
	if(this.speed > this.max_speed) {
	    this.speed--;
	}

	if(this.mesh == undefined) { return; }
	
	this.mesh.updateAnimation(1000*delta);
	this.mesh.phase = ( this.mesh.phase + ( Math.max( 0, this.mesh.rotation.z ) + 10.1 )  ) % 62.83;

	var angle = (Math.PI/0.3)*delta;
	var distance = this.speed * delta;
	if(Math.random()*10 < 0.09) {
	    this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
	}
	
	if(Math.random()*10 < 0.2) {	
	    if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
		this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
	    } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
		this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
	    } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
		this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
	    }
	}

	this.pos_x = this.mesh.position.x;
	this.pos_z = this.mesh.position.z;
	this.mesh.translateZ(distance);

//	this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
    };

}
Fish.prototype = new Object3D();
Fish.prototype.constructor = Fish;


/////////////////////////////////////////////////////////////
// Clouds
/////////////////////////////////////////////////////////////
function Cloud() {
    Object3D.call(this);
    this.speed = 0;
    this.type = "cloud";

    Cloud.prototype.Create = function(x ,y ,z, s, scene) {
	this.speed = 0.5+Math.random()*1;
	var group = new THREE.Object3D();
	var combined = new THREE.Geometry();
	var texture = THREE.ImageUtils.loadTexture( "textures/cloud.png" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);
	var cloud_material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, ambient: 0x000000 } );
	for(var i = 0; i < 4; i++) {
	    for(var n = 0; n < 3; n++) {
		var size1 = Math.random()*15+5;
		var size2 = Math.random()*15+7;
		var object = new THREE.Mesh( new THREE.SphereGeometry( size1, size1, 5), cloud_material);
		object.position.set(Math.random()*15*i, Math.random()*7, Math.random()*20*n);
		object.castShadow = true;
		group.add(object);
		var object = new THREE.Mesh( new THREE.SphereGeometry( size2, size2, 5 ), cloud_material);
		object.position.set(Math.random()*15*i, Math.random()*7, Math.random()*20*n);
		object.castShadow = true;
		group.add(object);
	    }
	}
	group.scale.set(s, s, s);
	group.position.set(x, y ,z);
	this.mesh = group;

	game.scene.add(this.mesh);
    };

    Cloud.prototype.Draw = function(time, delta, index) {
	this.mesh.position.x += this.speed;
	if(this.mesh.position.x > 4000) {
	    this.mesh.position.x = -4000;
	    this.mesh.position.z = Math.random()*4000-1500;
	    this.mesh.position.y = 465+Math.random()*400;
	}
    };
}
Cloud.prototype = new Object3D();
Cloud.prototype.constructor = Cloud;

/////////////////////////////////////////////////////////////
// Bubble
/////////////////////////////////////////////////////////////
function Bubble() {
    Object3D.call(this);
    this.type = "bubble";
    this.scale = 0.4;
    this.speed = 1.1;
    this.speed_scale = 0.001;
    this.fish = undefined;
    this.uniforms;
    this.attributes;
    this.hit = 0;
    this.time;
    this.posy = 0;
    this.time_start = -1;
    this.fish_scale = 1;
    this.dropped = 0;

    Bubble.prototype.Create = function(x, y, z, speed) {
//	var texture = THREE.ImageUtils.loadTexture( "textures/bubble2.png" );
//	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//	texture.repeat.set( 1, 1 );
	var material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, transparent: true, opacity: 0.2} );
	var object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 20 ), material );
	
	this.speed = speed;
	object.position.set(x,y,z);
	this.mesh = object;
	//this.mesh.rotation.set(Math.random()*10,Math.random()*10,Math.random()*10);
	this.mesh.scale.set(this.scale,this.scale,this.scale);
	this.mesh.that = this;
	CreateBoundingBox(this);
	game.scene.add(this.mesh);

	// Add fish
	var id = 1+Math.round(Math.random()*3);
	var fish = game.modelLoader.GetModel('fish'+id);
	this.fish_scale = 1+Math.random()*1;
	fish.scale.set(this.fish_scale, this.fish_scale, this.fish_scale);
	fish.rotation.set(0, Math.random()*Math.PI, 0);
	fish.position.set(0, -95*this.fish_scale, 0);
	this.fish = fish;
	this.fish.type = id;
	this.mesh.add(this.fish);
    };

    Bubble.prototype.Hit = function() {
	if(this.hit == 0) {
	    game.UpdateScore(1);
	    setTimeout(function() {
		game.soundLoader.PlaySound("burst");
	    }, 200);

	    this.hit = 1;
	    ExplodeMesh(this);
	}
    };

    Bubble.prototype.Remove = function() {
	game.scene.remove(this.emesh);
    };

    Bubble.prototype.Burst = function(time) {
	if(this.hit) {
	    this.uniforms.time.value += 3;
	    if(this.uniforms.time.value > 400) {
		this.remove = 1;
		game.scene.remove(this.emesh);
	    }

	    var thisvector = new THREE.Vector3();
	    thisvector.setFromMatrixPosition(this.fish.matrixWorld);

	    if(thisvector.y > 60) {
		this.fish.position.y -= 10;
	    } else {
		if(!this.dropped) {
		    this.dropped = 1;
		    var fish = new Fish();
		    fish.Spawn({
			x: thisvector.x, y: -10+Math.random()*30, z: thisvector.z,
			scale: this.fish_scale/3, max_speed: 5+Math.random()*50,
			boundary_minx: -200, boundary_maxx: 200,
			boundary_miny: -100, boundary_maxy: -50,
			boundary_minz: -2000, boundary_maxz: 2000,
			type: this.fish.type
		    });
		    game.objects.push(fish);
		    game.scene.remove(this.fish);
		} 
	    }
	}
    };    

    Bubble.prototype.Draw = function(time, delta, index) {
	if(this.fish != undefined) { 
	    this.fish.updateAnimation(1000*delta);
	    this.fish.phase = ( this.fish.phase + ( Math.max( 0, this.fish.rotation.z ) + 10.1 )  ) % 62.83;
	    
	    if(Math.random()*10 < 0.2) {	
		if(Math.random()* 10 > 5) {
		    this.fish.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
		} else {
		    this.fish.rotateOnAxis( new THREE.Vector3(0,1,0), Math.PI/4);
		}
	    }
	}
	if(this.mesh != undefined) {
	    this.mesh.position.y += this.speed;
	    if(this.mesh.position.y > 1500) {
		if(game.started) {
		    game.EndGame();
		}
	    }
	    this.posy = this.mesh.position.y;
	}
	this.Burst(time);
    };
}
Bubble.prototype = new Object3D();
Bubble.prototype.constructor = Bubble;

/////////////////////////////////////////////////////////////
// Boat
/////////////////////////////////////////////////////////////
function Boat() {
    Object3D.call(this);
    this.type = "boat";

    Boat.prototype.Create = function(x, y, z, scale) {
	var object = game.modelLoader.GetModel('boat');
	object.position.set(x,y,z);
	object.scale.set(scale, scale, scale);
	this.mesh = object;
	this.mesh.that = this;
	CreateBoundingBox(this);
	game.scene.add(object);

    };
    
    Boat.prototype.Draw = function(time, delta, index) {
	this.mesh.rotation.x = Math.sin(time/15)*Math.PI/16;
	this.mesh.rotation.z = Math.cos(time/10)*Math.PI/56;
    };
}
Boat.prototype = new Object3D();
Boat.prototype.constructor = Boat;
