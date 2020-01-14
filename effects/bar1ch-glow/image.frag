#version 130

#define pixel_fill $bar_width
#define pixel_empty $gap_width

#define background_opacity $background_opacity 
#define glow_radius      $glow_radius     
#define glow_strength    $glow_strength 
#define glow_strength2   $glow_strength2 
#define bar_strength     $bar_strength 

vec4 bar(float id){
    float unit_size=pixel_empty+pixel_fill;
    float x=(id*unit_size/iResolution.x);
    vec4 sample1= texture(iChannel1, vec2(x,0)) ;
    float max_=sample1.g*.5+sample1.r*.5;
    vec3 rgb=getRGB(x);
    return vec4(rgb,max_);
}

vec4 draw_bar(vec2 fragCoord){
    float unit_size=pixel_empty+pixel_fill;
    float id=floor(fragCoord.x / unit_size);
    float _offset=fract(fragCoord.x / unit_size);
    float threshold=pixel_fill/unit_size;
    if(_offset >= threshold)
        return vec4(0,0,0,0);
    float h=fragCoord.y/iResolution.y;
    vec4 b=bar(id);
    float max_=b.a;
    if(h>max_)
        return vec4(0,0,0,0);
    vec3 rgb=b.rgb;
    return vec4(rgb*max_,max_);
}

float bar_dist(float id,vec2 fragCoord){
    float unit_size=pixel_empty+pixel_fill;
    vec4 b=bar(id);
    float max_=b.a;
    float h=fragCoord.y/iResolution.y;
    if(h<=max_){
        if(fragCoord.x< id*unit_size)
            return id*unit_size-fragCoord.x;
        if(fragCoord.x< id*unit_size+pixel_fill )
            return 100000;
        else
            return fragCoord.x -id*unit_size-pixel_fill;
    }else{
        if(fragCoord.x< id*unit_size)
            return length(fragCoord- vec2(id*unit_size,max_*iResolution.y));
        if(fragCoord.x< id*unit_size+pixel_fill )
            return fragCoord.y-max_*iResolution.y;
        else
            return length(fragCoord- vec2(id*unit_size+pixel_fill,max_*iResolution.y));
    }

}

vec4 draw_glow(vec2 fragCoord){
    float unit_size=pixel_empty+pixel_fill;
    float id=floor(fragCoord.x / unit_size);
    vec4 out_=vec4(0,0,0,0);
    for(int id_=-glow_radius;id_<1+glow_radius;id_++){
        vec4 b=bar(id+id_);
        b.a/= pow(bar_dist(id+id_,fragCoord) ,glow_strength2 ) ;
        out_+=vec4(b.rgb*b.a,b.a);
    }
    return out_;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    fragColor=draw_bar(fragCoord)*bar_strength+draw_glow(fragCoord)*glow_strength;
    fragColor.a+=background_opacity;
}
