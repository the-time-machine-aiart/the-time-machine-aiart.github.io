#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform vec2 u_resolution;
uniform float u_time;

float ssin(float t){
    return 0.5*(sin(t) + 1.0);
}

vec2 rotate(vec2 uv, float theta, float warpx, float warpy){
    return vec2(uv[0]*cos(theta) - warpx*uv[1]*sin(theta), uv[0]*sin(theta) + warpy*uv[1]*cos(theta));
}


vec3 palette( float t, vec4 image) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.2, 0.7, 0.8);

    return a + b*cos( 5.*(c*t+d) ) + vec3(sin(image.r*0.5+t), 0, 0) + vec3(0, sin(image.g*0.2*t), 0) + vec3(0, 0, (image.b*0.5+t));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    
    float f_spatial = 10.0*sin(u_time*0.1) + sin(uv.y);
    float f_temporal = 64.0;
    float a_temporal = 0.0;
    
    vec2 s = vec2(sqrt(2.0), sqrt(2.0)); s = rotate(s, 0.01*u_time, 1.0, 1.0);
    vec2 j = vec2(sqrt(2.0), sqrt(2.0)); j = rotate(s, -0.01*u_time, 1.0, 1.0);
    uv = vec2(dot(uv, s), dot(uv, j));
    
    uv = rotate(uv, 3.14 * (90./4.0), 2.0, 90.0);
    vec2 uv0 = uv;
    
    // image color
    vec4 image = texture2D(u_tex0, uv);
    vec3 finalColor = vec3(0.0, 0.0, 0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * f_spatial) + a_temporal*sin(f_temporal*u_time);
        float d = length(uv) * exp(-length(uv0));
        vec3 col = palette(length(uv0) + i*.5 + u_time*0.01, image);
        d = sin(d*5.0 + u_time)/5.0;
        d = abs(d);
        d = pow(0.005 / d, 1.5);

        finalColor += col * d;
    }
        
    gl_FragColor = vec4(finalColor, 1.0);
}