uniform vec4 uDiffuseColor;
uniform vec4 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uShadowStrength;
uniform vec3 uShadowColor;

uniform sampler3D sColorMap;
uniform sampler2D sOffset;

in Vertex {
	vec4 color;
	vec3 worldSpacePos;
	vec3 worldSpaceNorm;
	vec3 texCoord0;
	flat int cameraIndex;
}vVert;

// Output variable for the color
layout(location = 0) out vec4 fragColor[TD_NUM_COLOR_BUFFERS];

// out vec4 fragColor;
void main()
{
	vec3 texCoord0 = vVert.texCoord0.stp;
	vec2 uv = texCoord0.st;

	vec4 colorOffset = texture(sOffset, uv);
	vec4 colorMapColor = texture(sColorMap, vec3(uv, colorOffset.r) );

	vec4 color = vec4(vec3(colorMapColor.r), 1.0);
	fragColor[0] = TDOutputSwizzle(color);

	// TD_NUM_COLOR_BUFFERS will be set to the number of color buffers
	// active in the render. By default we want to output zero to every
	// buffer except the first one.
	for (int i = 1; i < TD_NUM_COLOR_BUFFERS; i++)
	{
		fragColor[i] = vec4(0.0);
	}
}
