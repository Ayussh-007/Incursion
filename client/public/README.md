# INCURSION Public Assets

This directory contains static assets for the INCURSION game.

## Directories

### `/textures/earth/`
High-resolution Earth texture maps:
- `day.jpg` - Day-side color map (8K recommended from NASA)
- `night.jpg` - Night-side with city lights  
- `clouds.jpg` - Dynamic cloud layer
- `normal.jpg` - Normal/bump map for terrain relief
- `specular.jpg` - Specular/gloss map for water reflectivity

**Current Status**: Using procedural fallbacks until textures are added

**Free Sources**:
- [Solar System Scope](https://www.solarsystemscope.com/textures/)
- [NASA Visible Earth](https://visibleearth.nasa.gov/)
- [Planetary Pixel Emporium](http://planetpixelemporium.com/earth.html)

### `/fonts/`
3D fonts for Text3D components:
- `Orbitron_Bold.json` - Main title font (Three.js JSON format)

**Note**: Currently using CDN fonts. For full 3D typography, download from:
- [Three.js Font Repo](https://github.com/mrdoob/three.js/tree/dev/examples/fonts)
- Or convert using [Facetype.js](https://gero3.github.io/facetype.js/)

### `/audio/`
Sound effects for atmospheric experience:
- `atmospheric_hum.mp3` - Low-frequency ambient drone
- `radio_static.mp3` - White noise/interference
- `glitch.mp3` - Digital glitch sounds
- `impact.mp3` - Cinematic bass hit

**Free Sources**:
- [Freesound](https://freesound.org/)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/)

## Installation

1. Download assets from the sources above
2. Place them in the appropriate directories
3. The app will automatically detect and use them
4. Fallbacks are in place if assets are missing
