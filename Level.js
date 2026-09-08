function Level(canvas,R)
{
	this.R=R;
	this.num_of_segments=60;
	this.key_frame_freq=5;
	this.circle_freq=1;
	this.res=31;
	this.canvas=canvas;
	this.autoplay=true;
	this.path_maker=new GLObjectMaker(canvas);
	this.disc_maker=new GLObjectMaker(canvas);
	this.comet_maker=new GLObjectMaker(canvas);
	
	
	
	//--------------------------------------------------------
	//We crate here all our 3D assets to be used in the level:
	//--------------------------------------------------------
	
	//A spherical background
	this.bkg_sphere=new BackgroundSphere(canvas,{resolution:35});
	this.bkg_sphere.setTexture(R.textures.stars);
		
	
	//Define here a material object:
	this.path_material=new GLMaterial(canvas);
	this.path_material.setMatCap(R.textures.matcap);
	this.path_material.setMatCapColor([1.0,1.0,1.0]);
	this.path_material.setNormalMap(R.textures.mechanical);
	this.path_material.setNormalMapMagnitude(1);	
	
	//calculate the xyz of a circle for the path object
	this.xyz=new Float32Array(3*this.res);
	var c1=0;
	for(var i=0; i<this.res; i++)
	{
		this.xyz[c1]=0.5*Math.cos(2*3.1416*i/(this.res-1)-3.1416/2);c1+=1;
		this.xyz[c1]=0.5*Math.sin(2*3.1416*i/(this.res-1)-3.1416/2);c1+=1;
		this.xyz[c1]=0;c1+=1;
	}
	
	//create a fixed list of triangles and UV map for the path object
	this.uv=new Float32Array(2*this.res*2);
	this.tri=new Int16Array(6*(this.res-1));
	var c2=0;
	var c3=0;
	var c4=0;
	for(var j=0; j<2; j++)
	for(var i=0; i<this.res; i++)
	{
		this.uv[c2]=1-i/(this.res-1);c2+=1;
		this.uv[c2]=j/this.key_frame_freq;c2+=1;
		if(j<1 && i<this.res-1)
		{
			this.tri[c3]=c4;c3+=1;this.tri[c3]=c4+this.res;c3+=1;this.tri[c3]=c4+1;c3+=1;
			this.tri[c3]=c4+1;c3+=1;this.tri[c3]=c4+this.res;c3+=1;this.tri[c3]=c4+this.res+1;c3+=1;
		}
		c4+=1;
	}
	
	var object_maker=new GLObjectMaker(canvas);
	
	//Create the shape of a comet
	object_maker.sphere({resolution:7,width:1,height:1,depth:1});
	this.sphere=object_maker.flush();
	this.sphere.setTexture(R.textures.planet);
	var mat2=new GLMaterial(canvas);
	mat2.setDiffuseColor([1,1,1]);
	this.sphere.setMaterial(mat2);
	
	//Create the shape of a circle that is made out or 12 cylinders.
	for(var i=0;i<12;i++)
	{
		object_maker.pushMatrix();
			object_maker.rotate(i*3.14/6,[0,0,1]);
			object_maker.translate([0,4,0]);
			object_maker.rotate(Math.random()*2*3.14,[1,0,0]);
			object_maker.rotateZ(-3.14/2);
			object_maker.cylinder({resolution:21,width:2,height:2,depth:1});
		object_maker.popMatrix();
	}
	this.circle=object_maker.flush();
	this.circle.setTexture(R.textures.metal5);
	var mat3=new GLMaterial(canvas);
	mat3.setMatCap(R.textures.matcap2);
	mat3.setMatCapColor([1.0,1.0,1.0]);
	mat3.setNormalMap(R.textures.mechanical);
	mat3.setNormalMapRepetition(1);
	mat3.setNormalMapMagnitude(4);	
	mat3.setReflection(R.textures.stars);
	mat3.setReflectionColor([0.4,0.4,0.4]);	
	this.circle.setMaterial(mat3);
	
	object_maker.translate([0,4,0]);
	object_maker.rotateX(3.14/2);
	object_maker.cylinder({resolution:21,width:2,depth:2,height:1});
	this.disc=object_maker.flush();
	this.disc.setTexture(R.textures.metal5);
	this.disc.setMaterial(mat3);
		
	//create the array of segments
	this.segments=new Array();
	for(var i=0;i<this.num_of_segments;i++)
	{
		var s=new Segment(this,i+1);
		this.segments.push(s);
		if(i==25)this.circle_freq=5;
		else if(i==40)this.circle_freq=0;
		if(i>0)s.updateGeometry(this.segments[i-1]);
		else s.updateGeometry();
	}
	
	this.prev_i=this.key_frame_freq;
	this.user_angle=0;
	
	R.sounds.airplane.loop=true;
	R.sounds.airplane.play();
}

Level.prototype.getPosition=function(){return this.prev_i;};

Level.prototype.draw=function(t,angle)
{
	this.user_angle=angle;
	
	var cam=this.canvas.getCamera();
	
	cam.pushMatrix();
	//move camera to the new location:		
	this.goTo(t,angle);
	
	//draw the background
	this.bkg_sphere.draw();
	
	//draw the level segments
	for(var i=0;i<this.num_of_segments;i++)
			this.segments[i].draw();
			
	cam.popMatrix();
};

Level.prototype.autoPlayVideos=function(flag){this.autoplay=flag;};

Level.prototype.pause=function()
{
	for(var i=0;i<this.num_of_segments;i++)this.segments[i].pause();
};

Level.prototype.goTo=function(t,angle)
{
	var i=Math.floor(t);
	if(this.prev_i<i){var s=this.segments.shift();s.updateGeometry(this.segments[this.segments.length-1]);s.flushKeySegment();this.segments.push(s);}
			
			this.prev_i=i;
			
			var w=t-i;
			var w1=2+w;w1=(3-w1)*(3-w1)/2;
			var w2=1+w;w2=(-2*w2*w2+6*w2-3)/2;
			var w3=w;w3=w3*w3/2;
			
			this.segments[this.segments.length-1].fade(w);
			this.segments[0].fade(1-w);
			
			if(this.autoplay)this.segments[7+this.key_frame_freq].play();
			this.segments[7].pause();
			var o1=this.segments[5].orientation1;
			var o2=this.segments[5].orientation2;
			var o3=this.segments[6].orientation2;
			var m=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
			for(j=0;j<16;j++)
				m[j]=o1[j]*w1+o2[j]*w2+o3[j]*w3;
			mat4.inverse(m);
			
			var cam=this.canvas.getCamera();
			cam.translate([0,-1.5,0]);
			cam.rotate(angle,[0,0,1]);
			cam.multiply(m);
};
