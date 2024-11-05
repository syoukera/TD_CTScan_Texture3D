uniform vec4 uDiffuseColor;
uniform vec4 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uShadowStrength;
uniform vec3 uShadowColor;

uniform float instances;
uniform float disp_scale;
uniform float offset;

uniform sampler3D disp;

out Vertex {
	vec4 color;
	vec3 worldSpacePos;
	vec3 worldSpaceNorm;
	vec3 texCoord0;
	flat int cameraIndex;
}vVert;

void main()
{
	
	float w_offset				= ( 1 / float( textureSize( disp, 0 ).p ) )
									+ offset
									+ 0.5 / float( textureSize( disp, 0 ).p );

	// First deform the vertex and normal
	// TDDeform always returns values in world space
	vec4 worldSpacePos 			=TDDeform( P );
	gl_Position = TDWorldToProj(worldSpacePos);

	// This is here to ensure we only execute lighting etc. code
	// when we need it. If picking is active we don't need this, so
	// this entire block of code will be ommited from the compile.
	// The TD_PICKING_ACTIVE define will be set automatically when
	// picking is active.
#ifndef TD_PICKING_ACTIVE

	{ // Avoid duplicate variable defs
		vec3 texcoord = TDInstanceTexCoord(uv[0]);
		vVert.texCoord0.stp = texcoord.stp;
	}
	vVert.cameraIndex = TDCameraIndex();
	vVert.worldSpacePos.xyz = worldSpacePos.xyz;
	vVert.color = TDInstanceColor(Cd);
	vec3 worldSpaceNorm = TDDeformNorm( N );
	vVert.worldSpaceNorm = normalize(worldSpaceNorm);

#else // TD_PICKING_ACTIVE

	// This will automatically write out the nessessary values
	// for this shader to work with picking.
	// See the documentation if you want to write custom values for picking.
	TDWritePickingValues();

#endif // TD_PICKING_ACTIVE
}
