/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-06-16
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Player() {
    // player stats
    this.name = "";
    this.ammo = 36;
    this.zoom = 0;
    this.zoom_time = 0;
    this.reloading = 0;
    this.shot = 3;
    this.type = "player";

    Player.prototype.Reset = function() {
        this.ammo = 36;
        this.zoom = 0;
        this.zoom_time = 0;
        this.reloading = 0;
        this.shot = 3;
    };

    Player.prototype.Create = function(args) {
        //LockPointer();
        keys_enabled = 1;
        this.AddBindings();
    };

    Player.prototype.OnMouseUp = function(event) {
        this.mouseDown = 0;
        var mouseButton = event.keyCode || event.which;
        if(!game.started) {
            return;
        }

        if(mouseButton === 1){
            game.soundLoader.PlaySound("shoot");
            game.x_++;
            var x = ( (event.clientX + (31/2)) / window.innerWidth ) * 2 - 1 ;
            var y =- ( (event.clientY + (31/2)) / window.innerHeight ) * 2 + 1;

            var vector = new THREE.Vector3( x, y, 1 );
            game.projector.unprojectVector( vector, game.camera );
            var ray = new THREE.Raycaster(game.camera.position, vector.sub(game.camera.position ).normalize());
            var intersects = ray.intersectObjects(game.targets);
            var parrot_hit = 0;
            if (intersects.length > 0) {
                for(var i=0; i < intersects.length; i++) {
                    if(intersects[i].object.that.Hit != undefined) {
                        parrot_hit = 1;
                        intersects[i].object.that.Hit();
                    }
                    // Only smoke on first hit
                    if(intersects[i].object.that.type != "bubble") {
                        var particleGroup = new SPE.Group({
                            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
                            maxAge: 0.5,
                            obj: intersects[i].object.that.mesh,
                        });

                        var emitter = new SPE.Emitter({
                            position: new THREE.Vector3(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z),
                            positionSpread: new THREE.Vector3( 0, 10, 0 ),

                            acceleration: new THREE.Vector3(0, 4, 0),
                            accelerationSpread: new THREE.Vector3( 10, 10, 10 ),

                            velocity: new THREE.Vector3(10, 15, 10),
                            velocitySpread: new THREE.Vector3(10, 7.5, 10),

                            colorStart: new THREE.Color(0x000000),
                            //colorStartSpread: new THREE.Vector3(255, 255, 255),
                            colorEnd: new THREE.Color(0x333333),

                            duration: 0.5,
                            sizeStart: 2,
                            sizeEnd: 10,
                            particleCount: 500
                        });
                        particleGroup.addEmitter( emitter );
                        game.objects.push(particleGroup);
                        game.scene.add( particleGroup.mesh );
                    }

                }
            }
        }
    };

    Player.prototype.OnMouseDown = function(event) {
        if(this.reloading || !game.started) {
            return;
        }
        var mouseButton = event.keyCode || event.which;
        if(mouseButton === 1){ 
            this.mouseDown = 1;
        }
    };

    Player.prototype.OnMouseMove = function(jevent) {
    };

    Player.prototype.RemoveBindings = function() {
        $(document).unbind('mouseup');
        $(document).unbind('mousedown');
        this.attached_camera = 0;
    };

    Player.prototype.AddBindings = function() {
        $(document).mouseup(this.OnMouseUp.bind(this));
        $(document).mousedown(this.OnMouseDown.bind(this));
    };

    Player.prototype.Draw = function(time, delta) {
    };

}
Player.prototype = new Player();
Player.prototype.constructor = Player;
