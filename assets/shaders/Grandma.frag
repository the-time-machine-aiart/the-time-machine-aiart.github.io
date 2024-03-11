#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform vec2 u_resolution;
uniform float u_time;

vec3 palette( float t, vec4 image) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.2,0.7,0.8);

    return a + b*cos( 5.*(c*t+d) ) + sin(image.r*0.2*t) + sin(image.b+a+t);
}
void main () {
    vec2 uv = (gl_FragCoord.xy * 2. - u_resolution.xy )/u_resolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        // image color
        vec4 image = texture2D(u_tex0, uv);

        float d = length(uv) * exp(-length(uv0));
        vec3 col = palette(length(uv0) + i*.4 + u_time*.4, image);
        d = sin(d*10. + u_time)/8. + (image.g/255.);
        d = abs(d);
        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }
        
    gl_FragColor = vec4(finalColor, 1.0);
}