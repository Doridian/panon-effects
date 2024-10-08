//#version 130

#define opacity $opacity

#define pixel true
#define radius $radius
#define strength3 $strength
#define pow_exp $pow_exp
#define speed $speed
#define center_x $center_x
#define center_y $center_y

#define maxlife $maxlife
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float circle_radius=min(iResolution.x,iResolution.y)/2;

    fragCoord=fragCoord-iResolution.xy*vec2(center_x,center_y);
    bool lr=fragCoord.x<0;

    float point_radius=length(fragCoord);
    float arc=asin(fragCoord.y/point_radius);  // -pi/2 ~ pi/2

    float x=0.5-arc/asin(1.0)/2; // 0~1
    float y=(1-point_radius/circle_radius/radius/2);

    if(y>0){
        y=acos(1-y)/acos(0.0);

        float spin=0;
        if(lr){
            x=x+y*spin;
            if(x>1){
                x=2-x;
                lr=!lr;
            }
        }else{
            x=x-y*spin;
            if(x<0){
                x=-x;
               lr=!lr; 
            }
        }
    }
    if(y<0)
        y=-y/speed;

    float x2=(2-x)/2;
    x2=lr?x2:(1-x2);
    x=1-x;
    vec3 color=getRGB(lr?x:(1-x));//(1-x)*color_left.rgb+(x)*color_right.rgb;



    y=y*maxlife/iResolution.y;

        x=(lr?x:(1-x))*iChannelResolution[1].x/3;
        y=y*iResolution.y;
        vec4 c00= texelFetch(iChannel2, ivec2(floor(x) ,floor(y)  ),0);
        vec4 c01= texelFetch(iChannel2, ivec2(floor(x) ,ceil(y)  ),0);
        vec4 c10= texelFetch(iChannel2, ivec2(ceil(x) ,floor(y)  ),0);
        vec4 c11= texelFetch(iChannel2, ivec2(ceil(x) ,ceil(y)  ),0);
        float fx=fract(x);
        float fy=fract(y);
        fx=pow(fx,20);
        fy=pow(fy,20);
        fragColor=(fx*c10+(1-fx)*c00)*(1-fy)+fy*(fx*c11+(1-fx)*c01);
        //fragColor=c00;

    fragColor.r=pow(fragColor.r,pow_exp);
    fragColor.g=pow(fragColor.g,pow_exp);

    fragColor.rgb=color*(lr?fragColor.r:fragColor.g)*strength3;
    fragColor.a=opacity+ max(max(fragColor.r,fragColor.g),fragColor.b);
    //fragColor.a=opacity;
    
}
