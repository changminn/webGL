"use strict";

var canvas;
var gl;
//삼각형 4개, 사각형 1개(삼각형2개) => 4*3 + 2*4 = 18 개 정점
var numVertices  = 18;

var texSize = 64;


var program;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texture;

//텍스쳐 좌표계
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

/*
var texCoord2 = [
    vec2(0, 1),
    vec2(0.5, 1),
    vec2(1, 0)
];
*/
/*
    [위에서 쳐다봤을때]
    삼각형 4개 
  1 ㅡㅡㅡㅡㅡㅡ 2
    |*      * |
    |  *  *   |
    |   *4    |  
    | *     * |
   0ㅡㅡㅡㅡㅡㅡ 3
        
*/
var vertices = [
    vec4( -0.5, -0.5,  -0.5, 1.0 ),//0
        vec4( -0.5, -0.5,  0.5, 1.0 ),//1
        vec4(  0.5, -0.5,  0.5, 1.0 ),//2
        vec4(  0.5, -0.5,  -0.5, 1.0 ),//3
        vec4(    0,  0.5,    0, 1.0 )//4
];


var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.9, 0.9, 0.9, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [45.0, 45.0, 45.0];

var thetaLoc;

function configureTexture( image ) {
//1--------------------------------------------------------------------
	//텍스쳐 생성
    texture = gl.createTexture();
	//사용하기전에 바인딩
    gl.bindTexture( gl.TEXTURE_2D, texture );
	//webGL 애플리케이션은 Y축기준으로 텍스쳐 로딩
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	//바인딩 후 이미지 데이터 생성 => 이미지를 textImage2D 함수로 넘김
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
       //밉맵 생성
    gl.generateMipmap( gl.TEXTURE_2D );
	//텍스쳐 필터 지정
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
   
//--------------------------------------------------------------------
}

function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[3]);
}

function triple(a, b, c) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[6]);
     texCoordsArray.push(texCoord[2]);

} 

function colorCube()
{
   triple( 0, 4, 1);
   triple( 3, 4, 0 );
   triple( 2, 4, 3);
   triple( 1, 4, 2 );
   quad( 0, 1, 2,3 );
}

function chageSelectedValue(){
    var SelectedImg = document.getElementById("Selected Imgae");
    var selectedValue = SelectedImg.options[SelectedImg.selectedIndex].value;
  
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );



    //
    // Initialize a texture => html에서 가져왓음
    //

    //var image = new Image();
    //image.onload = function() {
     //   configureTexture( image );
    //}
    //image.src = "SA2011_black.gif"


/*------------------------------------------------------------------
    var image1 = document.getElementById("texImage1");
    var image2 = document.getElementById("texTmage2");
    var image3 = document.getElementById("texTmage3");



    configureTexture( image1, image2, image3 );
    //텍스쳐 바인딩======================================================
    	//텍스쳐 인덱스를 바꿈=>webGL은 여러개의 텍스쳐를 사용할 수 있음
    gl.activeTexture( gl.TEXTURE0 );
    	//프로그램에서 사용할 때 바뀌지 않을 텍스쳐 인덱스를 지정함, TEXTURE0을 바인딩
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    	//바인딩된 텍스쳐를 sampler  uniform에  지정함, 0=>TEXTURE0 (텍스쳐를 바인딩하고 sampler에 연결)
    	//getuniform으로 Tex0이름의 변수 찾아서 변수 id가져오고 해당변수 id에 값을 넣음
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);
   //==========================================================================
    
    
    //configureTexture( image2 );
    //두번째 텍스쳐 바인딩=======================================================
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
    //========================================================================

    //configureTexture( image3 );
    //세번째 텍스쳐 바인딩======================================================
    gl.activeTexture( gl.TEXTURE2 );
    gl.bindTexture( gl.TEXTURE_2D, texture3 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex2"), 2);
    //========================================================================
*/

    change();

    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};

    render();

}

function change(){

    var SelectedImg = document.getElementById("SelectedImgae");
    var id = SelectedImg.options[SelectedImg.selectedIndex].value;

    var image = document.getElementById(id);
    configureTexture( image );
}



var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, flatten(theta));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}
