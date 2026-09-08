function Segment(level,id)
{
	this.id=id;
	this.level=level;
	this.is_keysegment=false;
	var res=this.level.res;
	
	this.level.path_maker.appendTriangles(this.level.tri);
	
	if(this.id % this.level.key_frame_freq==0)
	{
		this.is_keysegment=true;
		//create a video sphere
		this.video_angle=Math.random()*1.2-0.6;
		if(this.id % (2*this.level.key_frame_freq)==0) this.video_angle=0.6;
		else this.video_angle=-0.6;
		//this.video_dir=Math.random();
		//if(this.video_dir>0.5)this.video_dir=1;else this.video_dir=-1;
		this.video_sphere=new VideoSphere(this.level.canvas,51);
		var mod=(this.id/this.level.key_frame_freq) % 6;
		if(mod==0)this.video_sphere.setVideoTexture(this.level.R.textures.nasa1);
		else if(mod==1)this.video_sphere.setVideoTexture(this.level.R.textures.nasa2);
		else if(mod==2)this.video_sphere.setVideoTexture(this.level.R.textures.nasa3);
		else if(mod==3)this.video_sphere.setVideoTexture(this.level.R.textures.nasa4);
		else if(mod==4)this.video_sphere.setVideoTexture(this.level.R.textures.nasa5);
		else if(mod==5)this.video_sphere.setVideoTexture(this.level.R.textures.nasa6);
		else if(mod==6)this.video_sphere.setVideoTexture(this.level.R.textures.nasa7);
		else if(mod==7)this.video_sphere.setVideoTexture(this.level.R.textures.nasa8);
	}
}

Segment.prototype.play=function()
{
	if(this.is_keysegment)this.video_sphere.play();
};

Segment.prototype.pause=function()
{
	if(this.is_keysegment)this.video_sphere.pause();
};

Segment.prototype.updateGeometry=function(previous)
{
	//compute a random orientation for the new segment 
	this.orientation1=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	if(previous)
		mat4.set(previous.orientation2,this.orientation1);
	this.orientation2=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];	
	mat4.set(this.orientation1,this.orientation2);
	mat4.translate(this.orientation2,[0,0,-1]);
	var r=[2*Math.random()-1,2*Math.random()-1,0];
	if(previous)
	{
		r[0]+=previous.rot[0];r[1]+=previous.rot[1];r[2]+=previous.rot[2];
	}
	this.rot=r;
	var m=Math.sqrt(r[0]*r[0]+r[1]*r[1]+r[2]*r[2]);
	r[0]/=m;r[1]/=m;r[2]/=m;
	mat4.rotate(this.orientation2,3.14/20,r);
	
	//add two circles of xyz points with the new orientation
	for(var j=0; j<2; j++)
	{
		this.level.path_maker.pushMatrix();
		if(j==0)this.level.path_maker.multiply(this.orientation1);
		else this.level.path_maker.multiply(this.orientation2);
		this.level.path_maker.appendXYZ(this.level.xyz);
		this.level.path_maker.popMatrix();
	}
	
	//update UV map, (only V based on the order-id of the segment)
	var c=1;
	var mod=this.id % 5;
	for(var j=0; j<2; j++)
	{
		var v=(mod+j)/5;
		for(var i=0; i<this.level.res; i++)
		{this.level.uv[c]=v;c+=2;}
	}
	this.level.path_maker.appendUV(this.level.uv);
		
	
	
	//add discs
	this.level.disc_maker.pushMatrix();
		this.level.disc_maker.multiply(this.orientation1);
		this.level.disc_maker.appendObject(this.level.disc);
		if(this.level.circle_freq==0) 
		{
			if(Math.random()<0.04)this.level.disc_maker.appendObject(this.level.circle);
		}
		else if(this.id % this.level.circle_freq==0)this.level.disc_maker.appendObject(this.level.circle);
	this.level.disc_maker.popMatrix();
	
	
	var r=2*3.1415*Math.random();
	//add three comets
	for(var i=0;i<3;i++)
	{
		this.level.comet_maker.pushMatrix();
			this.level.comet_maker.identity();//multiply(this.orientation1);
			this.level.comet_maker.rotate(r+i*3.14/3,[0,0,1]);
			this.level.comet_maker.translate([0,3+5*Math.random(),0]);
			var s=0.1+0.4*Math.random();
			this.level.comet_maker.scale([s,s,s]);
			this.level.comet_maker.rotate(2*3.14*Math.random(),[2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
			this.level.comet_maker.appendObject(this.level.sphere);
		this.level.comet_maker.popMatrix();
	}
	this.flushKeySegment();
};

Segment.prototype.initKeySegment=function()
{
	if(typeof this.object!=='undefined') return;
	
	this.object=this.level.path_maker.flush();
	this.object.disablePicking(true);
	this.object.setTexture(this.level.R.textures.metal5);
	this.object.setMaterial(this.level.path_material);
			
	this.discs=this.level.disc_maker.flush();
	this.discs.disablePicking(true);
	this.discs.setTexture(this.level.disc.getTexture());
	this.discs.setMaterial(this.level.disc.getMaterial());
			
	this.comets=this.level.comet_maker.flush();
	this.comets.disablePicking(true);
	this.comets.setTexture(this.level.sphere.getTexture());
	this.comets.setMaterial(this.level.sphere.getMaterial());	
};

Segment.prototype.fade=function(value)
{
	if(!this.is_keysegment) return;
	
	this.object.getShader().setColorMask([1.0,1.0,1.0,value]);
	this.discs.getShader().setColorMask([1.0,1.0,1.0,value]);
	this.comets.getShader().setColorMask([1.0,1.0,1.0,value]);
};

Segment.prototype.flushKeySegment=function()
{
	if(!this.is_keysegment) return;
	
	this.initKeySegment();
	
	this.level.path_maker.flush(this.object);
	this.object.computeNormals();//because we do not provide them
	this.object.computeTangents();//because we use normalmap
	
	this.level.comet_maker.flush(this.comets);
	
	this.level.disc_maker.flush(this.discs);
	this.discs.computeTangents();//because we use normalmap
};

Segment.prototype.draw=function()
{
	if(this.is_keysegment)
	{
		this.object.updateShader();
		this.object.draw();
		
		this.discs.updateShader();
		this.discs.draw();
		
		var cam=this.level.canvas.getCamera();
		cam.pushMatrix();
			cam.multiply(this.orientation1);
			cam.pushMatrix();
				cam.rotate(-this.level.user_angle-this.video_angle,[0,0,1]);
				cam.translate([0,2,0]);
				cam.scale([0.25,0.25,0.25]);
				cam.rotate(this.video_angle,[0,0,1]);
				cam.rotate(-this.video_angle/2,[0,1,0]);
				this.video_sphere.draw();
			cam.popMatrix();
			if(this.level.canvas.isNewFrame())
			{
				//this.video_angle+=this.video_dir*0.01*cam.getInverseFPSSmooth();  
				//if(this.video_angle>0.6)this.video_dir=-1;else if(this.video_angle<-0.6)this.video_dir=1;
				this.comets.rotate(0.05*cam.getInverseFPSSmooth(),[0,0,1]);
			}
			this.comets.updateShader();
			this.comets.draw();
		cam.popMatrix();
		
	}
};