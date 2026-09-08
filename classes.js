function VideoSphere(c,res)
{
	this.is_playing=false;
	this.canvas=c;
	this.res=res;
	this.xyz=new Float32Array(3*res*res);
	this.nrm=new Float32Array(3*res*res);
	this.uv=new Float32Array(2*res*res);
	this.tri=new Int16Array(6*(res-1)*(res-1));
	var c2=0;
	var c3=0;
	var c4=0;
	for(var i=0; i<res; i++)
	for(var j=0; j<res; j++)
	{
		this.uv[c2]=1-i/(res-1);c2+=1;
		this.uv[c2]=j/(res-1);c2+=1;
		if(i<res-1 && j<res-1)
		{
			this.tri[c3]=c4;c3+=1;this.tri[c3]=c4+1;c3+=1;this.tri[c3]=c4+res;c3+=1;
			this.tri[c3]=c4+1;c3+=1;this.tri[c3]=c4+res+1;c3+=1;this.tri[c3]=c4+res;c3+=1;
		}
		c4+=1;
	}
	this.object=new GLObject(c);
	this.updateGeometry(0);
	this.object.setTriangles(this.tri);
	this.object.setUV(this.uv);
	this.dir=0;
	this.t=0;
	var self=this;
	this.object.onTap=function(e){
		if(self.t>=1) //if it is flat
			self.pause();
		else if(self.t<=0) //if it is sphere
			self.play();
	};			
	this.video=null;
}

VideoSphere.prototype.draw=function()
{
	var cam=this.canvas.getCamera();
	cam.acc_updated_since_last_touch=true;
	
	if(this.dir!=0)
	{	
		if(this.canvas.isNewFrame())
		{
			
			this.t+=this.dir*0.5*cam.getInverseFPSSmooth();if(this.t>=1){this.t=1;this.dir=0;}
			else if(this.t<=0) {this.t=0;this.dir=0;this.is_playing=false;
			if(this.video!=null)this.video.pause();}
			this.updateGeometry(this.t);
			if(this.video!=null)this.video.volume=this.t;
		}
	}
	if(this.is_playing && this.canvas.isNewFrame() && this.object.getTexture())this.object.getTexture().update();
	this.object.updateShader();
	this.object.draw();
};

VideoSphere.prototype.setMaterial=function(mat)
{
	this.object.setMaterial(mat);
};

VideoSphere.prototype.setVideoTexture=function(t)
{
	this.is_playing=false;
	this.video=this.object.setVideoTexture(t,{loop:true,autoplay:false});
};

VideoSphere.prototype.updateGeometry=function(t)
{
	var c1=0;
	var phi=0;
	var theta=0;
	for(var i=0; i<this.res; i++)
	for(var j=0; j<this.res; j++)
	{
		phi=3.1416*(j/(this.res-1)-0.5);
		theta=2*3.1416*i/(this.res-1)-3.1415/2;
		this.nrm[c1]=Math.cos((1-t)*phi)*Math.cos((1-t)*theta)  *(1-t);//       +0*t;
		this.xyz[c1]=this.nrm[c1]       +    2*2*(4/3)*(-i/(this.res-1)+0.5)  *t;
		c1+=1;
		this.nrm[c1]=Math.sin((1-t)*phi) *(1-t);//  +0*t;
		this.xyz[c1]=this.nrm[c1]  +      2*2*(j/(this.res-1)-0.5)  *t;
		c1+=1;
		this.xyz[c1]=Math.cos((1-t)*phi)*Math.sin((1-t)*theta)*(1-t);//   +0*t;
		this.nrm[c1]=this.xyz[c1]   +    1*t;
		c1+=1;
	}
	this.object.setXYZ(this.xyz);
	this.object.setNormals(this.nrm);
};

VideoSphere.prototype.play=function()
{
	this.dir=1;
	this.is_playing=true;
	if(this.video!=null)this.video.play();
}

VideoSphere.prototype.pause=function()
{
	this.dir=-1;
}

