/*!
 * 3D model viewer plugin for jQuery utlising Three.js
 * @require jQuery
 * @require Three.js
 * @author John Noel <john.noel@rckt.co.uk>
 * @license http://creativecommons.org/licenses/by-sa/3.0/ Creative Commons Attribution Share-Alike
 */
;(function($) {
    var methods = {
        init: function(options) {
            var opts = $.extend(true, {}, $.fn.threeDeeModelViewer.options, options);

            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');

                if (!data) { // initalise data
                    data = {};
                    data.model = opts.model;
                    // renderer
                    data.renderer = new THREE.WebGLRenderer({
                        antialias: true,
                        clearColor: opts.backgroundColour,
                        clearAlpha: opts.backgroundAlpha,
                        stencil: false
                    });
                    data.renderer.setSize($this.width(), $this.height());
                    $this.append(data.renderer.domElement);
                    // scene
                    data.scene = new THREE.Scene();
                    // camera
                    data.camera = new THREE.PerspectiveCamera( 70, $this.width() / $this.height(), 1, 1000 );
                    data.camera.position = opts.cameraPosition;
                    data.scene.add(data.camera);
                    // model
                    $this.trigger('threedee.playerloaded');

                    data.opts = opts;
                    $this.data('3dmv', data);

                    if (data.model.mesh != '') {
                        $this.threedee('loadModel', data.model.mesh, data.model.texture);
                    }

                    if (opts.autorotate) {
                        $this.threedee('autorotate', 0);
                    }
                }

                $this.threedee('animate');
            });
        },

        /**
         * Loads a model into the viewer and removes any existing model
         *
         * Passing a string as the model parameter will just call
         * THREE.JSONLoader().load() whereas passing an object will call
         * THREE.JSONLoader().createModel() if you've loaded the data yourself
         * via XMLHttpRequest
         *
         * @param string|object model Model URL or object
         * @param string texture Texture URL
         * @return jQuery
         */
        loadModel: function(model, texture) {
            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');

                if (data.mesh) {
                    data.scene.remove(data.mesh);
                }

                var callback = function(geometry) {
                    data.texture = THREE.ImageUtils.loadTexture(texture, THREE.UVMapping);
                    data.material = new THREE.MeshBasicMaterial( {color: 0xffffff, map: data.texture, wireframe: false} );
                    data.mesh = new THREE.Mesh(geometry, data.material);
                    data.scene.add(data.mesh);
                    $this.trigger('threedee.sceneloaded').data('3dmv', data);
                };

                if (typeof model == 'object') {
                    new THREE.JSONLoader().createModel(model, callback);
                } else {
                    new THREE.JSONLoader().load(model, callback);
                }
            })
        },

        /**
         * Sets the renderer to be full-screen
         *
         * If you've got a full-screen option on your viewer then calling this
         * will set all the correct renderer parameters (aspect ratio, size
         * etc.)
         *
         * @param boolean fullscreen Whether to go fullscreen or come out of it
         * @return jQuery
         */
        toggleFullscreen: function(fullscreen) {
            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');

                if (fullscreen) {
                    data.renderer.setSize($(window).width(), $(window).height());
                    data.camera.aspect = $(window).width() / $(window).height();
                    data.camera.updateProjectionMatrix();
                } else {
                    data.renderer.setSize($this.width(), $this.height());
                    data.camera.aspect = $this.width() / $this.height();
                    data.camera.updateProjectionMatrix();
                }
            });
        },

        /**
         * Moves a model in the specified direction by the specified amount
         *
         * A model is always moved around its origin. Use the constants
         * $.fn.threeDeeModelViewer.LEFT|RIGHT|UP|DOWN|IN|OUT to move / rotate
         * the requisite direction. Amount can be a plain float which sets the
         * direction to that value, or can be a modified e.g. +=0.1.
         *
         * @param int direction LEFT, RIGHT, UP, DOWN, IN or OUT
         * @param string|float amount The amount to translate
         * @return jQuery
         */
        translate: function(direction, amount) {
            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');
                if (!data || !data.mesh) {
                    return;
                }

                if ((typeof(amount) == 'string') &&
                    ($.inArray(amount.substr(0,1), ['+','-','*','/']) != -1) &&
                    amount.substr(1,1) == '=') {
                    var ec = ''; // eval code
                    var am = parseFloat(amount.substr(2));
                    switch (direction) {
                        case $.fn.threeDeeModelViewer.LEFT:
                            ec = 'data.mesh.rotation.y';
                            am *= -1;
                            break;
                        case $.fn.threeDeeModelViewer.RIGHT:
                            ec = 'data.mesh.rotation.y';
                            break;
                        case $.fn.threeDeeModelViewer.UP:
                            ec = 'data.mesh.rotation.x';
                            am *= -1;
                            break;
                        case $.fn.threeDeeModelViewer.DOWN:
                            ec = 'data.mesh.rotation.x';
                            break;
                        case $.fn.threeDeeModelViewer.IN:
                            ec = 'data.camera.position.z';
                            am *= -1;
                            break;
                        case $.fn.threeDeeModelViewer.OUT:
                            ec = 'data.camera.position.z';
                            break;
                    }

                    ec += amount.substr(0,2);
                    ec += am;
                    eval(ec);
                } else {
                    switch (direction) {
                        case $.fn.threeDeeModelViewer.LEFT:
                            data.mesh.rotation.y = (amount * -1);
                            break;
                        case $.fn.threeDeeModelViewer.RIGHT:
                            data.mesh.rotation.y = amount;
                            break;
                        case $.fn.threeDeeModelViewer.UP:
                            data.mesh.rotation.x = (amount * -1);
                            break;
                        case $.fn.threeDeeModelViewer.DOWN:
                            data.mesh.rotation.x = amount;
                            break;
                        case $.fn.threeDeeModelViewer.IN:
                            data.camera.position.z = (amount * -1);
                            break;
                        case $.fn.threeDeeModelViewer.OUT:
                            data.camera.position.z = amount;
                            break;
                    }
                }
            });
        },


        /**
         * Gets the x rotation value for the first viewer in the set
         * @return float
         */
        rotationX: function() {
            var $this = this.first(), data = $this.data('3dmv');
            return data.mesh.rotation.x;
        },

        /**
         * Gets the y rotation value for the first viewer in the set
         * @return float
         */
        rotationY: function() {
            var $this = this.first(), data = $this.data('3dmv');
            return data.mesh.rotation.y;
        },

        /**
         * Internal function for requesting an animation frame and calling the
         * render function
         * @see render
         * @private
         */
        animate: function() {
            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');
                if (data) {
                    window.requestAnimationFrame(function() { $this.threedee('animate'); });
                    $(this).threedee('render');
                }
            });
        },

        /**
         * Internal function for rendering a model viewer's scene
         * @private
         */
        render: function() {
            return this.each(function() {
                var data = $(this).data('3dmv');
                if (data) {
                    data.renderer.render(data.scene, data.camera);
                }
            });
        },

        /**
         * Resets a viewer to its initial state with regards rotation and zoom
         * @return jQuery
         */
        reset: function() {
          return this.each(function() {
              var $this = $(this), data = $this.data('3dmv');

              $this.threedee('translate', $.fn.threeDeeModelViewer.UP, 0)
                .threedee('translate', $.fn.threeDeeModelViewer.LEFT, 0)
                .threedee('translate', $.fn.threeDeeModelViewer.OUT, data.opts.cameraPosition.z);
          });
        },

        /**
         * Set whether this player will autorotate the model
         *
         * Call when you want the autorotate to start after a certain delay, or
         * pass true to the fullstop function to stop autorotating entirely. If
         * the autorotate option was not set on this viewer, this function has
         * no effect
         *
         * @param int delay How long (in milliseconds) to delay the autorotate
         * @param boolean fullstop Stop autorotating entirely
         */
        autorotate: function(delay, fullstop) {
            var delay = (delay == undefined) ? 1500 : delay;
            return this.each(function() {
                var $this = $(this), data = $this.data('3dmv');

                // if we're not autorotating, just exit
                if (!data.opts.autorotate) {
                    return;
                }

                // if it's already autorotating, stop
                if (data.autorotateDelay || data.autorotateTimer) {
                    clearTimeout(data.autorotateDelay);
                    clearInterval(data.autorotateTimer);
                    if (fullstop) {
                        return;
                    }
                }

                data.autorotateDelay = setTimeout(function() {
                    data.autorotateTimer = setInterval(function() {
                        $this.threedee('translate', $.fn.threeDeeModelViewer.LEFT, '+=' + 0.015);
                    }, 33);
                }, delay);

                $this.data('3dmv', data);
            });
        }
    };

    $.fn.threeDeeModelViewer = function(method) {
        if (methods[method]) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if (typeof method == 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method: '+method+' not supported');
        }
    };

    $.fn.threeDeeModelViewer.options = {
        model: {
            mesh: '',
            texture: ''
        },
        backgroundColour: 0xFFFFFF,
        backgroundAlpha: 1.0,
        cameraPosition: { x: 0, y: -0.5, z: 8 },
        autorotate: false
    };

    $.fn.threeDeeModelViewer.LEFT = 1;
    $.fn.threeDeeModelViewer.RIGHT = 2;
    $.fn.threeDeeModelViewer.UP = 3;
    $.fn.threeDeeModelViewer.DOWN = 4;
    $.fn.threeDeeModelViewer.IN = 5;
    $.fn.threeDeeModelViewer.OUT = 6;
})(jQuery);

/*!
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}