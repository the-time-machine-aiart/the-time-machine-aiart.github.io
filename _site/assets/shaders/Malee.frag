#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform vec2 u_resolution;
uniform float u_time;

float random(vec3 n) {
    return fract(abs(cos(dot(n,vec3(5.,-5.,5.))*5.))*255.+1.0);   
}

void main () {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec4 image = texture2D(u_tex0, st);

    vec3 p = vec3(gl_FragCoord.xy+vec2(u_time)*64.0,0.0)+vec3(image.r, 0, 0)+vec3(0, image.g, 0)+vec3(0, 0, image.b);
    float b = (random(floor(p/64.0))*0.5+random(floor(p/32.0))*0.3+random(floor(p/4.0))*0.2);
	gl_FragColor = vec4(vec3(b*0.6),1.0);
}