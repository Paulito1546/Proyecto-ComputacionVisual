# AR Markers

This directory contains custom AR markers for use with AR.js integration.

## Creating Custom Markers

1. Visit: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
2. Upload your image or design a pattern
3. Download the `.patt` file and the marker image
4. Place both files in this directory

## Usage

The markers are used by the ARView component to detect and track objects in the camera feed.

## Default Markers

The application includes a simulated marker detection for demonstration purposes. For production use:

1. Generate custom markers using the AR.js marker generator
2. Place `.patt` files here
3. Update the ARView component to use actual AR.js tracking

## File Structure

```
markers/
├── marker-1.patt       # Pattern file for marker 1
├── marker-1.png        # Visual reference for marker 1
├── marker-2.patt       # Pattern file for marker 2
├── marker-2.png        # Visual reference for marker 2
└── README.md           # This file
```

## Testing

Print the marker images and point your camera at them when in AR mode to see 3D objects overlaid on the markers.
