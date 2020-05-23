"use strict";

var canvas;
var gl;
var i;
var points = [];
//var points1 = [];
var NumTimesToSubdivide = 7;

/*
//up Tri
var ab1;
var ac1;
var ab2;
var ac2;
var ccU;

//down Tri
var ac1;
var ac2;
var bc1;
var bc2;
var ccD
*/

//onload함수로 시작함
window.onload = function init()// 콜백함수, onload = 모든코드가 로드된 후 시작할 위치를 지정
{
    canvas = document.getElementById( "gl-canvas" );
    // 캔버스를 읽어옴, getElementById 함수로 "gl-canvas"를 불러옴

    gl = WebGLUtils.setupWebGL( canvas );
    // 불러온 canvas를 인자로 넘겨, WebGL코드를 설정해줌

    if ( !gl ) { alert( "WebGL isn't available" ); }
    //예외처리

    //
    //  Initialize our data 
    //

    // 네 점 초기ㅗ하

    var vertices = [
        vec2(-1,-1),//a
        vec2(-1, 1),//b
        vec2(1, 1),//c
        vec2(1, -1)//d
    ];
    /*
     b     c
     *-----* 
     |   * |
     | *   |
     *-----*
     a     d

    */
   // triangle(vertices[0], vertices[1], vertices[2], vertice[3]);
    divideTriangle(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
    


   // divideTriangleUP( vertices[0], vertices[1], vertices[2],NumTimesToSubdivide);
   // divideTriangleDOWN( vertices[3], vertices[4], vertices[5],  NumTimesToSubdivide);


    /*==========================================================*/
    //WebGL 기본 코드 
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0  ); // X => (//색상 흰색으로)
    /*==========================================================*/


    /*====================================================================*/
    //  Load shaders and initialize attribute buffers
    //GPU에 넘겨줄 Program 객체
    //initShaders사용하여 shader 로드, 컴파일, 링크하여 Program객체 생성
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    /*====================================================================*/


    /*========================================================================================*/
    // Load the data into the GPU
    //Vertex buffer 객체를 GPU에 로드함
    //버퍼를 만들어서 data를 줌성
    var bufferId = gl.createBuffer();//버퍼 생성
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );//bufferId에 binding
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );//데이터를 버퍼에
    //flatten() => js배열을 float32 배열로 변환 (OpenGL - JS간 배열 해석이 다르므로 row -> column)
    /*========================================================================================*/


    /*========================================================================================*/
    // Associate out shader variables with our data buffer
    //프로그램 내 변수와 shader변수를 연결해야함 => 버퍼내 이름, 타입, 위치가 필요
    //vPosition 변수에 실어 보냄, vPosition => 그 변수의 위치를 받아오겠다
    var vPosition = gl.getAttribLocation( program, "vPosition" );//getAttributeLocation = 위치
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );//vertex 속성, 2차원
    gl.enableVertexAttribArray( vPosition );
    /*========================================================================================*/


    //랜더링 = 그림을 그려줌
    render();
};

/*==========================*/
//WebGL은 삼각형만 디스플레이함/
/*==========================*/

//스택에 4개 넣고
//기본요소 TRIANGLE_FAN를 사용, 인자 4개
function triangle( a, b, c, d )
{
    points.push( a, b, c, d );
}


// X => (/* 배경을 빨간색으로 지정하고 안의 사각형을 힌색으로 지정해 안의 사각형만 그려주면됌*/)
//사각형을 그려줌, 중간 공간은 안그림
function divideTriangle( a, b, c, d, count )
{

    // check for end of recursion
    //더이상 쪼갤 필요가 없을때 
   if ( count === 0 ) {
        triangle( a, b, c, d);
    }

   else {
        //위
        var bc1 = mix( b, c, 1/3);
        var bc2 = mix( b, c, 2/3);

        //왼쪽
        var ab1 = mix( a, b, 1/3);
        var ab2 = mix( a, b, 2/3);

        //오른쪽
        var cd1 = mix( c, d, 1/3);
        var cd2 = mix( c, d, 2/3);

        //밑
        var ad1 = mix( a, d, 1/3);
        var ad2 = mix( a, d, 2/3);

        //중간 사각형 vertex
        var ma = mix( ab1, cd2, 1/3);
        var mb = mix( ab2, cd1, 1/3);
        var mc = mix( ab2, cd1, 2/3);
        var md = mix( ab1, cd2, 2/3);
        //=> 중간에 있는 4개 vertex를 사용해서 삼각형 두개로 사각형 만듬  
        //최종적 실행은 triangle(ma, mb, mc, md) => 각 사각형 마다 해주면됌      


        /*

            b  bc1 bc2  c
            *---*---*---*
            | 1 | 2 | 3 |
         ab2*---*---*---*cd1
            | 4 | 5 | 6 |
         ab1*---*---*---*cd2
            | 7 | 8 | 9 |
            *---*---*---* 
            a  ad1 ad2  d

        */
         --count;


        divideTriangle(ab2, b, bc1, mb, count);  //1번사각형
        divideTriangle(mb, bc1, bc2, mc, count); //2번사각형
        divideTriangle(mc, bc2, c, cd1, count);  //3번사각형
        divideTriangle(ab1, ab2, mb, ma, count); //4번사각형

        //중간 사각형은그리지 않으므로
        //divideTriangle(ma, mb, mc, md, count); //5번사각형 

        divideTriangle(md, mc, cd1, cd2, count); //6번사각형
        divideTriangle(a, ab1, ma, ad1, count);  //7번사각형
        divideTriangle(ad1, ma, md, ad2, count); //8번사각형
        divideTriangle(ad2, md, cd2, d, count);  //9번사각형
    }
}

/*
function divideTriangleDOWN( a, b, c, count )
{

    

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else{
        var aa = mix( a, b, 1/3 );
        var bb = mix( a, b, 2/3 );

        var ac= mix( a, c, 2/3 );

        var cc = mix(ac, bb, 0.5);


        triangle(aa,bb,cc);
     }
}
*/
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    for(i = 0; i< points.length; i = i+4){ 
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4);
    }
    //삼각형 두개 로 나눠서 위 삼각형 아래 삼각형 따로 함수 구현하지 않기 위해 Triganles 대신 Triangles_fan 사용
}
