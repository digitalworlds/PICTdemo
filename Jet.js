function Jet(canvas,R)
{
	var maker=new GLObjectMaker(canvas);
	this.printer=canvas.getPrinter();
	maker.scale([0.3,0.3,0.3]);
	maker.pushMatrix();
		maker.translate([0,0,0.25])
		maker.box({width:1.2,height:0.05,depth:0.2});
		maker.rotateX(3.14/2);
		maker.translate([-0.6,0,0]);
		maker.cylinder({resolution:16,width:0.1,height:0.4,depth:0.1,});
		maker.translate([1.2,0,0]);
		maker.cylinder({resolution:16,width:0.1,height:0.4,depth:0.1,});
	maker.popMatrix();
	maker.rotateX(-3.14/2);
	maker.trapezoid({width:0.7,height:1,depth:0.2,width2:0.5,depth2:0.05});
	maker.pushMatrix();
		maker.translate([-0.175,-0.55,0]);
		maker.cylinder({resolution:16,width:0.2,height:0.1,depth:0.2,width2:0.1,depth2:0.1});
		maker.translate([0.35,0,0]);
		maker.cylinder({resolution:16,width:0.2,height:0.1,depth:0.2,width2:0.1,depth2:0.1});
	maker.popMatrix();
	maker.rotateY(-3.14/2);
	maker.translate([0,-0.25,-0.5]);
	maker.trapezoid({width:0.5,height:0.5,depth:0.05,width2:0.25,depth2:0.02});
	maker.translate([0,0,1]);
	maker.trapezoid({width:0.5,height:0.5,depth:0.05,width2:0.25,depth2:0.02});
	this.model=maker.flush();
	
	var mat=new GLMaterial(canvas);
	mat.setMatCap(R.textures.matcap3);
	mat.setNormalMap(R.textures.mechanical);
	this.model.setMaterial(mat);
	this.model.setTexture(R.textures.metal5);
}

Jet.prototype.draw=function(p,clr)
{
	if(p)
	{
	this.printer.pushMatrix();
	this.printer.translate([-2*Math.sin(p[0]),p[1],-2*Math.cos(p[0])]);
	this.printer.rotateX(p[3]);
	this.printer.rotateZ(p[2]);
	if(clr)
        this.model. getShader ( ) . setColorMask ( clr ) ;
    else
        this.model. getShader ( ) . setColorMask ( [ 1 , 1 , 1 , 1 ] ) ;
	this.model.draw();
	this.printer.popMatrix();
	}
}