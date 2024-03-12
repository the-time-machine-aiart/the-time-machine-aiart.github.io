#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width,height)   
uniform float u_time;       // Time in seconds since load

uniform sampler2D u_tex0;

void main() 
{
    vec2 p = gl_FragCoord.xy/u_resolution.x*10.;
    vec2 st = gl_FragCoord.xy/u_resolution.x;

    // load image
    vec4 image = texture2D(u_tex0, st);
    
    for(float i=0.0; i<8.0;i++)
    {
        p.x += sin(p.y+i+u_time*.3);
        p.y += cos(p.x*10.+i+u_time);
        p *= mat2(2,-8,8,6)/8.;
    }
    gl_FragColor = cos(p.xyxy*.3+vec4(3.+sin(image.r*0.1+u_time), 2.+sin(image.g*0.05),1.+(image.b*0.05),0))*.5 + vec4(0, 0,0,1.);
}