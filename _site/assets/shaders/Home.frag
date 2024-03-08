#ifdef GL_ES
    precision mediump float;
#endif

#define PI 3.14159265359
#define HALF_PI 1.57079632675
#define TWO_PI 6.283185307

#define SAMPLES 60

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

float linearstep(float begin, float end, float t) {
    return clamp((t - begin) / (end - begin), 0.0, 1.0);
}

float cubicPulse( float c, float w, float x )
{
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

float random( in vec2 st )
{
	return fract( sin( dot(st.xy, vec2(-30.950,-10.810) )) * 43758.5453123  );	    
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth 
    vec2 u = f*f*(3.0-2.0*f);
    u = smoothstep(0.,1.,f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

mat2 rotate(float angle)
{
    return mat2( cos(angle),-sin(angle),sin(angle),cos(angle) );
}

vec2 center(vec2 st)
{
    float aspect = u_resolution.x/u_resolution.y;
    st.x = st.x * aspect - aspect * 0.5 + 0.5;
    return st;
}

vec3 debug_sdf(float sdf, bool full)
{
   vec3 color = vec3(1.0) - sign(sdf)*vec3(0.1,0.4,0.7);
   if(full)
   {
	color *= 1.0 - exp(-2.0*abs(sdf));
	color *= 0.89 + .5*cos(80.0*sdf);
	color = mix( color, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(sdf)) );
   }

    return color;
}

float cell(vec2 st)
{
    st -= 0.5;
    // st /= 0.25;
    st *= rotate(PI*.25);

    float d = sdBox(st,vec2(1.5,1.5));      // change box size because of space
    return d;
}

vec4 scene(vec2 st, float t)
{   
    st *= 6.0;

    float iT = floor(t / .25);
    float fT = fract(t / .25);
        fT = pow(fT,.20);

    float spacing = 2.0;        
    vec2 pos = vec2(0.5,0.5);

    if(iT == -.0)    
        pos += vec2(0.0,-spacing)*fT;
    else if(iT == 1.0)    
        pos += vec2(0.0,-spacing) +
        vec2(-spacing,0.0)*fT;
    else if(iT == 2.0)    
        pos += vec2(-spacing,-spacing) + 
        vec2(0.0,spacing) *fT;
    else if(iT == 3.0)    
        pos += vec2(-spacing,0.0)+ 
        vec2(spacing,0.0) *fT;

    st -= pos * 2.0;
    st *= 0.8 * (1.0-fT);
    st *= rotate( TWO_PI / 4.0 * (iT + fT));

    vec4 sdf = vec4(0.0);
        sdf.x = cell(fract(st));
        sdf.y = sdBox(st-pos,vec2(.25));
        sdf.y = cell(st-pos)+1.15;

    return sdf;
}

float traceShadows(vec2 position, vec2 lightPosition,float t){
    vec2 direction = normalize(lightPosition - position);
    float lightDistance = length(lightPosition - position);

    float rayProgress =  0.0001;
    float nearest = 9999.0;
    float hardness = 8.50 + random(position) * .50;

    for(int i=0 ;i<SAMPLES; i++){
        vec4 scene = scene(position + direction * rayProgress,t);
        float sceneDist = scene.y;

        if(sceneDist <= 0.0){
            return 0.0;
        }
        if(rayProgress > lightDistance){
            return clamp(nearest,0.0,1.0);
            //return 1.0;
        }

        nearest = min(nearest, hardness * sceneDist / rayProgress);
        rayProgress = rayProgress + sceneDist;
    }

    return 0.0;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec4 image = texture2D(u_tex0, st);
    st = center( st );
    st = st * 2.0 - 1.0;

    // time
    float seconds = 12.0;
    float t = fract(u_time/seconds);

    vec4 sdf = scene(st,t);

    vec2 light = vec2(0.0,0.0);
    float shadows = traceShadows(st,light,t);

    vec3 background = image.r + vec3(254.0,226.0,223.0) / 255.0;
    vec3 shadow = vec3(0.07);

    vec3 color1 = vec3(image.r+sin(st.x+u_time), 0, 0) + vec3(100,110.0,130.0) / 255.0;
    vec3 color2 = vec3(36.0,39.0,100.0) + vec3(0, 0, image.b+sin(st.x+u_time))/ 255.0;
    vec3 color3 = vec3(189.0,183.0,107.0) / 255.0;
    vec3 color4 = vec3(140.0,41.0,86.0) / 255.0;

    const int COLOR_COUNT = 8;

    vec3 colors[COLOR_COUNT];
        colors[0] = color1;
        colors[1] = background;
        colors[2] = color2;
        colors[3] = background;
        colors[4] = color3;
        colors[5] = background;
        colors[6] = color4;
        colors[7] = background;

    // color
    vec3 color = vec3(0.07);
        color = background;        

    t = t * float(COLOR_COUNT) - 1.0;

    int color_index = int(floor(mod(sdf.x*20.0+t,float(COLOR_COUNT))));

    for(int i = 0; i < COLOR_COUNT; i++)
    {     
        vec3 c = colors[i];

        if(i == int(color_index)){
            color = mix(color,c,1.0 - smoothstep(0.0,0.03,sdf.x));
        }
    }

    gl_FragColor = vec4(color, 1.0);
}