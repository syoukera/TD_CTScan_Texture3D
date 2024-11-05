#define MAX_MARCH_STEPS 256

uniform vec4 uDiffuseColor;
uniform vec4 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uShadowStrength;
uniform vec3 uShadowColor;

uniform mat4 mCamera; // 4x4 Camera matrix
uniform vec4 uCamera; // FOV, View angle method, near, far
uniform vec2 uRenderResolution; // Resolution of Render TOP

uniform sampler3D sColorMap;
uniform sampler2D sOffset;

// 回転行列のuniform変数を追加
uniform mat4 uRotationMatrix;

in Vertex {
	vec4 color;
	vec3 worldSpacePos;
	vec3 worldSpaceNorm;
	vec3 texCoord0;
	flat int cameraIndex;
}vVert;

// Output variable for the color
layout(location = 0) out vec4 fragColor[TD_NUM_COLOR_BUFFERS];

// Data structure to represent a ray
struct Ray
{
	vec3 origin;
	vec3 direction;
};

// Calculates the ray origin and direction based on the uv coordinate, the camera matrix and parameters.
Ray UVToRay(vec2 uv)
{
	vec2 res = uRenderResolution.xy; // Render resolution in pixels

	// Calculates the right angle based on the 'fov' and 'viewing angle method' of the camera.
	float z = mix(res.x, res.y, uCamera.y) / tan(radians(uCamera.x) * 0.5) * 0.5;
	uv -= 0.5; // Center the coordinate (0,0) should be in the center of the screen.

	return Ray(
		mCamera[3].xyz, // Extract the camera position
		mat3(mCamera) * normalize(vec3(uv * res, -z)) // Rotate the direction based on the matrix
	);
}

// // Returns the distance between point 'p' and the closest point on the surface of any object in the scene.
// float Scene(vec3 p)
// {
// 	// Defining a sphere, similar to a circle in 2D.
// 	vec3 spherePosition = vec3(0.0, 0.5, 0.0);
// 	float sphereRadius = 0.5;
// 	return length(p - spherePosition) - sphereRadius;
// }

// The raymarch loop. Steps through the scene until it hits an object. Returns the distance to that object.
float March(Ray ray, float maxDistance)
{
	// Make sure we move forward.
	float distanceStep = 0.05;
	float distanceOrigin = 0.0;

	float energy = 0.0;

	for (int i = 0; i < MAX_MARCH_STEPS; i++) {

		distanceOrigin += distanceStep;

		// Find the new position in space.
		vec3 p = ray.origin + ray.direction * distanceOrigin;

		
		// 回転行列を適用
        vec4 rotatedPos = uRotationMatrix * vec4(p, 1.0);
        vec3 samplingPos = rotatedPos.xyz + 0.5; // [0, 1]空間に変換
        

		vec4 colorMapColor = texture(sColorMap, samplingPos);
		if (colorMapColor.r > 1000.0) {
			// return distanceOrigin;
			energy += colorMapColor.r/1000.0;
		}
	}

	return energy;
}

// out vec4 fragColor;
void main()
{
	// vec2 uv = vUV.st;
	vec3 texCoord0 = vVert.texCoord0.stp;
	vec2 uv = texCoord0.st;
	Ray ray = UVToRay(uv); // Calculate the ray based on the uv coordinate.

	float dist = March(ray, uCamera.w);	// Raymarches the scene and returns the distances to the closest surface of any object.
	
	// if (dist < uCamera.w) { // If it's smaller than camera 'far', we hit something.
	// 	vec3 p = ray.origin + ray.direction * dist; // Find the position 
	// 	color.rgb = p; // And render it as color.
	// }

	// vec4 colorMapColor = texture(sColorMap, vec3(uv, 0.5) );


	vec4 color = vec4(vec3(dist), 1.0);
	fragColor[0] = TDOutputSwizzle(color);
	// fragColor[0] = TDOutputSwizzle(vec4(uCamera.xyz, 1.0));

	// TD_NUM_COLOR_BUFFERS will be set to the number of color buffers
	// active in the render. By default we want to output zero to every
	// buffer except the first one.
	for (int i = 1; i < TD_NUM_COLOR_BUFFERS; i++)
	{
		fragColor[i] = vec4(0.0);
	}
}
