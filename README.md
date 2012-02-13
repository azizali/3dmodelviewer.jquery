# 3dmodelviewer.jquery

A 3D model viewer utilising [Three.js](http://github.com/mrdoob/three.js/) and jQuery released under a [Creative Commons Attribution Share-Alike license](http://creativecommons.org/licenses/by-sa/3.0/).

## Motivation

A simple way of getting a single - possibly textured - 3D model onto a page.

## Basic usage

```html
<div id="player" style="width:400px;height:400px;"></div>
```

```javascript
$('#player').threeDeeModelViewer({
	model: { mesh: 'yourmeshurl.json' }
});
```

## Advanced usage

```javascript
$('#player').threeDeeModelViewer({
	model: {
		mesh: 'yourmeshurl.json',
		texture: 'yourtexture.jpg'
	},
	backgroundColour: 0xFF00FF,
	backgroundAlpha: 1.0,
	cameraPosition: { x: 10, y: -10, z: 100 },
	autorotate: true
});
```

## Live example

This live example was implemented for a 3D scanning project for a local museum and includes a proprietary Flash fallback. __Warning__: large/complex model.

[Museums Sheffield: Bull Ornament](http://www.museums-sheffield.org.uk/collections/objects-in-3d/ornaments/bull-ornament)

The example demonstrates some usage of the minimal API available to the viewer as well as event usage.

## Requirements

* A browser with WebGL support - Chrome and Firefox, Opera Next, Safari has support but buggy
* An operating system with OpenGL support - all modern systems with updated display drivers
* Existing 3D models + textures and a way to convert to Three.js model format

The viewer is WebGL only due to the support for texturing which isn't available in the Three.js canvas (software) renderer. The viewer makes no attempt to detect support - this is an implementation job and could be done any number of ways ([Modernizr](http://www.modernizr.com/) etc.).

Models and textures are not provided and should be provided by the implementor. There are a number of exporters in the [Three.js](https://github.com/mrdoob/three.js/tree/master/utils/exporters) package. If you want a wholly free route, the [Blender exporter](https://github.com/mrdoob/three.js/tree/master/utils/exporters/blender) is a good, tested option.

## Options

### model

The model to load on creation. Should be an object with a mesh and texture e.g.

```javascript
model: {
	mesh: 'url',
	texture: 'url'
}
```

The ```loadModel``` method allows you to pass a pre-loaded object if you, for instance, want to load the mesh and texture yourself (e.g. XMLHttpRequest). The option model however must always be passed a URL.

### backgroundColour

British developer so note the 'u' in colour. Set this to the colour you'd like the backdrop of the player to be. If you're doing true fullscreen then setting this to a colour will prevent the backdrop being black. Only solid colours are supported unless you want to set it to transparent (see backgroundAlpha below). Defaults to 0xFFFFFF.

### backgroundAlpha

Float value between 0.0 and 1.0 to set the alpha value of the backgroundColour. Defaults to 1.0.

### cameraPosition

The initial position of the camera. Should be an object with an x, y and z position e.g.

```javascript
cameraPosition: { x:0, y:0, z:0 }
```

Defaults to ```{ x: 0, y: -0.5, z: 8 }```.

### autorotate

A boolean whether to set the model autorotating on load. Defaults to false.

## API

The viewer has a minimal API for basic model manipulation and events. This allows for the creation of simple controls:

```javascript
$('#player').threeDeeModelViewer('translate', $.fn.threeDeeModelViewer.UP, '+=0.07');
```

The available methods are:

### loadModel(model, texture)

Load in a new model and texture, removing any existing model.

### toggleFullScreen(fullscreen)

Toggles the viewer to be fullscreen (```$(window).width() x $(window).height()```) versus being contained by its container element.

### translate(direction, amount)

Move the model in the desired direction by the specified amount. The available directions are:

* $.fn.threeDeeModelViewer.LEFT
* $.fn.threeDeeModelViewer.RIGHT
* $.fn.threeDeeModelViewer.UP
* $.fn.threeDeeModelViewer.DOWN
* $.fn.threeDeeModelViewer.IN
* $.fn.threeDeeModelViewer.OUT

The amount can be an absolute (float) value e.g 1.2 or it can be a variable amount e.g. +=1.2. The latter is most useful for when you don't want to maintain your own state count. Valid amounts are:

* +=
* -=
* /=
* *=

The code for executing this is run through ```eval``` after some basic checking so it's advisable not to hand this kind of control over to users e.g. deep linking. Suggestions on a more concise and secure way of allowing this are very welcome.

The model is always centered on an origin and can't move beyond rotations and zoom in / out.

### rotationX() and rotationY()

Returns the current rotation value for the first player element.

### reset()

Resets the current rotation and zoom levels to default.

### autorotate(delay, hardstop)

You can set the model to autorotate after a specified delay, or you can set the model to completely stop autorotating with the hardstop parameter. The idea with this function is that if you're letting a user translate the model (through controls), you call ```autorotate(null, true)``` to stop any rotation, then after a user is finished, call ```autorotate(1500)``` to get the model going again after 1.5 seconds. If the autorotate option is set to false with the player, this method has no effect.

## Events

### 3dmodelviewer.playerloaded

When the player has been initialised and when the model has begun to be loaded (if provided).

### 3dmodelviewer.sceneloaded

Triggered when a model has been loaded into the scene. If you've passed a texture this may or may not be loaded at this point but you're guaranteed to have a mesh at this point.

## Gotchas

### WebGL support

Just because a browser has ```WebGLRenderingContext``` does not mean it can necessarily display WebGL content. When tested, Safari indicated support but when trying to create a ```webgl``` failed despite Chrome (Webkit) displaying fine. Checking for ```WebGLRenderingContext``` and then creating a canvas and testing the ```webgl``` context works:

```javascript
var webglSupport = (!!window.WebGLRenderingContext);
if (webglSupport) {
    var glc = $('<canvas width="1" height="1" id="glCanvasTest" />').appendTo('body')[0];
    try {
        var c = glc.getContext('webgl') || glc.getContext('experimental-webgl');
    } catch (e) { }
    $(glc).remove();

    webglSupport = (c instanceof WebGLRenderingContext);
}
```

### Model loading

If you're loading very large models, it's worth checking whether a visitor has XMLHttpRequest level 2 as you can then load the model and also get progress events to let the user know how long before, the model at least, is piped to them.
