//==============================================================================
// Author: Nergal
// Date: 2014-06-12
//==============================================================================
"use strict";

function Game() {
    this.net;
    this.container;
    this.scene;
    this.camera;
    this.renderer;
    this.stats;
    this.clock;
    this.objects = [];
    this.collision_objects = [];    
    this.draw_objects = [];
    this.screen_width = window.innerWidth;
    this.screen_height = window.innerHeight;
    this.view_angle = 75; // 45
    this.aspect = this.screen_width/this.screen_height;
    this.near = 0.1;
    this.far = 6500;
    this.inv_max_fps = 1/60;
    this.frameDelta = 0;
    this.update_end = 0;
    this.anim_id = 0;
    this.spectate = 0;
    this.modelLoader;
    this.terrain;
    this.player;
    this.keyboard;
    this.targets = [];

    this.fishes = [];

    this.score = 0;
    this.time = 0;
    this.started = 0;

    this.highscore = 0;
    this.player_name = "";
    this.x_ = 0;

    Game.prototype.StartGame = function() {
        game.Reset();
        this.net.send_GetHighScore();
        game.player.Reset();

        $('#score').text(game.score);
        $('#round_msg').text("Prepare");
        $('#round_msg2').text("3");
        $('#round').fadeIn(1000);
        $('#timer').show();
        this.spectate = 0;
        $('#info').hide();


        setTimeout(function() {
            $('#round_msg2').text("3");
            game.soundLoader.PlaySound("countdown", game.camera.position, 500);
        }, 2500);
        setTimeout(function() {
            $('#round_msg2').text("2");
            game.soundLoader.PlaySound("countdown", game.camera.position, 500);
        }, 3500);
        setTimeout(function() {
            $('#round_msg2').text("1");
            $('#round').fadeOut(300);
            game.soundLoader.PlaySound("countdown", game.camera.position, 1000);
        }, 4500);
        setTimeout(function() {
            game.started = 1;
            game.AddBubbles();
        }, 5000);

    };

    Game.prototype.SetName = function() {
        this.net.send_Score(this.player_name, this.score, this.x_);
    };

    Game.prototype.EndGame = function() {
        this.started = 0;
        this.spectate = 1;
        this.soundLoader.PlaySound("end", game.camera.position, 500);

        var txt = "<font color='#FF3333'>Sorry, no highscore.</font>";
        if(game.highscore < this.score) {
            txt = "<font color = '#FDD017'>YOU GOT HIGHSCORE</font>";
        }

        $('#timer').fadeOut(2000);
        $('#msgboard').fadeOut(1000);
        $('#round').fadeIn(1000);
        $('#round_msg2').html("");
        $('#round_msg').html("Saved fishes: <font color='#33FF33'>"+this.score+"</font><br>"+txt);

        setTimeout(function() {
            if(game.player_name == "" && game.highscore < game.score) {
                console.log("GET NAME!");
                GetName();
            } else if(game.highscore < game.score) {
                game.SetName();
            }
            game.net.send_GetScore();
            $('#round').fadeOut(2000);
            $('#info').fadeIn(2000);
        }, 5000);

    };

    Game.prototype.UpdateScore = function(score) {
        this.score += score;
        if(this.score < 0) {
            this.score = 0;
        }
        $('#score').html("<font color='#FF11FF'>"+this.score+"</font>");
    };


    Game.prototype.Reset = function() {
        this.update_end = 1;
        for(var i = 0; i < 0; i++) {
            if(this.objects[i].type != "player") {
                this.objects[i].Remove();
                this.objects.slice(i, 1);
            }
        }
        this.x_ = 0;
        this.score = 0;
        this.targets = [];
        this.objects = [];
        this.spectate = 1;
        this.player.Reset();

        this.InitScene();
        this.BuildScene(1);
    };


    Game.prototype.InitScene = function() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0025 );
        this.camera = new THREE.PerspectiveCamera(this.view_angle, this.aspect, this.near, this.far);
        this.scene.add(this.camera);


        this.camera.lookAt(this.scene.position);

        this.camera.rotation.order = "YXZ";
        this.camera.up = new THREE.Vector3(0,1,0);
    };

    Game.prototype.Init = function() {
        this.net = new Net();
        // Change this to your server and port
        this.net.Initialize("http://localhost:8082");

        this.net.send_GetScore();

        this.clock = new THREE.Clock();
        this.stats = new Stats();
        $('#stats').append(stats.domElement);

        this.InitScene();

        this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        this.renderer.setSize(this.screen_width, this.screen_height);
        this.renderer.setClearColor(0x000000);

        this.keyboard = new THREEx.KeyboardState();
        this.container = document.getElementById('container');
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        THREEx.WindowResize(this.renderer, this.camera);

        this.renderer.shadowMapEnabled = true;
        //    this.renderer.shadowMapSoft = true;


        this.projector = new THREE.Projector();

        this.modelLoader = new ModelLoader();
        this.soundLoader = new SoundLoader();

        this.modelLoader.AddJSON({ subDivides: 0,
                                 obj: 'models/boat/boat5.js',
                                 name: "boat" 
        });

        this.modelLoader.AddMorph({ subDivides: 2,
                                  obj: 'models/fishes/fish_a.js',
                                  name: "fish1" 
        });
        this.modelLoader.AddMorph({ subDivides: 2,
                                  obj: 'models/fishes/fish_b.js',
                                  name: "fish2" 
        });
        this.modelLoader.AddMorph({ subDivides: 2,
                                  obj: 'models/fishes/fish_c.js',
                                  name: "fish3" 
        });
        this.modelLoader.AddMorph({ subDivides: 2,
                                  obj: 'models/fishes/fish_d.js',
                                  name: "fish4"
        });


        // Add sounds
        this.soundLoader.Add({file: "sounds/burst.mp3",
                             name: "burst"
        });
        this.soundLoader.Add({file: "sounds/shot2.mp3",
                             name: "shoot"
        });
        this.soundLoader.Add({file: "sounds/gameover.wav",
                             name: "end"
        });
        this.soundLoader.Add({file: "sounds/countdown.mp3",
                             name: "countdown"
        });

        // Add player
        this.player = new Player();
        this.player.Create();
        this.objects.push(this.player);

        this.InitiateModels();
        this.animate();
    };

    Game.prototype.InitiateModels = function() {
        var x = this.modelLoader.PercentLoaded();
        if(x < 100) {
            var that = this;
            setTimeout(function() { that.InitiateModels()}, 500);
            return;
        }
        $('#info_loadbar').fadeOut(1000);
        this.BuildScene(0);
    };

    Game.prototype.AddBubbles = function() {
        var x = 0;
        if(this.score < 10) {
            x = 2+Math.round(Math.random()*this.score);
        } else {
            x = Math.round(Math.random()*3);
        }
        for(var i= 0; i < x; i++) {
            var bubble = new Bubble();
            var speed = 0.5+Math.random()*this.score/50;
            bubble.Create(-400+Math.random()*800,0,-600+Math.random()*-1000, speed);
            this.objects.push(bubble);
        } 	
    };

    Game.prototype.BuildScene = function(real) {
        // Light!
        var sun = new Sun();
        sun.Create(0,200,0,this. scene, this.renderer);

        // Clouds
        for(var i= 0; i < 10; i++) {
            var cloud = new Cloud();
            cloud.Create(Math.random()*4000-1500, 450+Math.random()*400, Math.random()*4000-1500, 4, this.scene);
            this.objects.push(cloud);
        } 

        if(!real) {
            this.AddFishes();
        }

        // add water
        var water = new Water();
        water.Create(this.scene);
        this.objects.push(water);

        this.camera.position.set(0,250,0);
        this.camera.setRotateX(this.camera.getRotateX()-3);
        this.spectate = 1;

        for(var i = 0; i <= 1; i++) {
            var boat = new Boat();
            boat.Create(-550, 105, -800, 100);
            this.objects.push(boat);
            this.boat = boat;
        }

        //	this.AddText();

        this.update_end = 0;
    };

    Game.prototype.AddFishes = function() {
        for(var i = 0; i < 50; i++) {
            var fish = new Fish();
            fish.Spawn({
                x: -1000+Math.random()*2000, y: -10+Math.random()*30, z: -1000+Math.random()*2000,
                scale: 0.4, max_speed: 5+Math.random()*50,
                boundary_minx: -200, boundary_maxx: 200,
                boundary_miny: -100, boundary_maxy: -50,
                boundary_minz: -2000, boundary_maxz: 2000,
                type: Math.round(1+Math.random()*3)
            });
            this.objects.push(fish);
        }
    };    

    Game.prototype.AddText = function() {
        var geometry = new THREE.TextGeometry( "102", {
            size: 20,
            height: 5,
            curveSegments: 3,
            font: "helvetiker",
            weight: "bold",
            style: "normal",
            bevelThickness: 2,
            bevelSize: 1,
            bevelEnabled: true	    
        });

        var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0xAA33AA}) );
        mesh.rotation.set( 0, 0.5, 0 );
        mesh.position.set( 0, 150, -500 );
        this.scene.add( mesh );

    };


    Game.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    Game.prototype.animate = function() {
        this.anim_id = requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.update();
    };

    this.step = 5;
    this.last = -1;
    Game.prototype.update = function() {
        var delta = this.clock.getDelta(),
        time = this.clock.getElapsedTime() * 10;

        if(this.started) {
            this.time += delta;
        }

        if(this.started && Math.round(this.time) != this.last) {
            if((Math.round(this.time) % this.step) == 0) {
                if(this.step > 1) {
                    if(this.score > 0) {
                        this.step--;
                    }
                }
                game.AddBubbles();
            }
            this.last = Math.round(this.time);
        }

        if(this.update_end) {
            cancelAnimationFrame(this.anim_id);
            this.ResetScene();
            this.update_end = 0;
            return;
        }

        this.frameDelta += delta;

        while(this.frameDelta >= this.inv_max_fps) {
            THREE.AnimationHandler.update(this.inv_max_fps);
            for(var i = 0; i < this.objects.length; i++) {
                if(this.objects[i] != undefined) {
                    if(this.objects[i].remove == 1) { 
                        this.objects.splice(i, 1);
                    } else {
                        this.objects[i].Draw(time, this.inv_max_fps, i);
                    }
                }
            }
            this.frameDelta -= this.inv_max_fps;

            if(this.spectate) {
                //	this.camera.position.x = Math.floor(Math.cos(time/100) * 2000);
                //	this.camera.position.z = Math.floor(Math.sin(time/100) * 2000);
                //	this.camera.lookAt(this.tower.mesh.position);
            }
        }	
        this.stats.update();
    };
}

