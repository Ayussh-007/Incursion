# INCURSION - Asset Requirements

## Required Textures (client/public/textures/)

For the hyper-realistic Earth rendering, you'll need high-quality texture maps:

### Earth Textures
1. **earth_daymap.jpg** - Day-side color map (8K recommended)
   - Source: NASA Visible Earth (https://visibleearth.nasa.gov/)
   - Recommended: Blue Marble Next Generation

2. **earth_nightmap.jpg** - Night-side with city lights
   - Shows illuminated cities and populated areas
   - Available from NASA Earth Observatory

3. **earth_normal.jpg** - Normal/bump map for terrain relief
   - Adds realistic topographical depth

4. **earth_specular.jpg** - Specular/gloss map
   - Defines water vs land reflectivity

5. **earth_clouds.jpg** - Dynamic cloud layer
   - Transparent areas for realistic cloud coverage

### Free Texture Sources
- **Solar System Scope**: https://www.solarsystemscope.com/textures/
- **NASA Images**: https://www.nasa.gov/multimedia/imagegallery/
- **Planetary Pixel Emporium**: http://planetpixelemporium.com/earth.html

## Fonts (client/public/fonts/)

1. **helvetiker_bold.typeface.json** - 3D Text font for Three.js
   - Download from Three.js examples: https://github.com/mrdoob/three.js/tree/dev/examples/fonts
   - Or convert custom fonts using: https://gero3.github.io/facetype.js/

## Audio Files (client/public/audio/)

1. **atmospheric_hum.mp3** - Low-frequency ambient drone
2. **radio_static.mp3** - White noise/radio interference
3. **glitch_01.mp3** - Short digital glitch sound
4. **impact_bass.mp3** - Cinematic bass hit
5. **transition_whoosh.mp3** - Swoosh sound effect

### Free Audio Sources
- **Freesound**: https://freesound.org/
- **BBC Sound Effects**: https://sound-effects.bbcrewind.co.uk/
- **NASA Audio**: https://www.nasa.gov/connect/sounds/

## 3D Models (client/public/models/)

Future scenes (SERN laboratory) will require:
- Laboratory exterior GLTF/GLB model
- Control room interior
- Terminal/workstation models

## Setup Instructions

1. Download the required assets from the sources above
2. Place them in their respective directories:
   ```
   client/public/
   ├── textures/
   ├── fonts/
   ├── audio/
   └── models/
   ```

3. For now, the app will use fallback colors if textures are missing

## Placeholder Mode

Until high-quality textures are added, the Earth component will:
- Use solid colors for the day/night cycle
- Display a basic textured sphere without detailed features
- Still demonstrate the core cinematic experience
