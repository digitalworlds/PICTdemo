function Gates(canvas)
{
	this.canvas=canvas;
	this.door_trans=0;
	this.door_angle=0;
	this.are_opening=false;
	this.are_closing=false;
	this.are_open=false;
	this.step1=true;

	this.R=new ResourceManager(canvas);
	this.R.addSound("machine","machine_1.mp3");
	this.R.addSound("bang1","bang1.mp3");
	this.R.addSound("bang2","bang2.mp3");
	this.R.addTexture("dw_window1","window1.png");
	this.R.addTexture("dw_window2","window2_dw.png");
	
	var object_maker=new GLObjectMaker(canvas);
	
	object_maker.translate([0,0,-1.2]);
	object_maker.rotateZ(3.1415);
	object_maker.rect(1,4/5,1,1);
	this.door=object_maker.flush();
	//this.door.disablePicking(true);
	var self=this;
	this.door.onTap=function(e){ self.toggle();};
		
	this.door.setTexture(this.R.textures.dw_window1);
	
	object_maker.identity();
	object_maker.translate([0,-1.5/4,0]);
	object_maker.rect(1,4/5,1,1);
	this.door2=object_maker.flush();
	this.door2.disablePicking(true);
	this.door2.setTexture(this.R.textures.dw_window2);
}

Gates.prototype.areOpen=function(){return this.are_open;};

Gates.prototype.canMove=function(){
if(this.are_open || (this.are_opening && !this.step1) || (this.are_closing && !this.step1)) return true;
else return false;
};

Gates.prototype.open=function()
{
	if(!this.are_open)
	{
		if(!this.are_opening && !this.are_closing)
			this.R.sounds.machine.play();
		this.are_closing=false;
		this.are_opening=true;
	}
};

Gates.prototype.close=function()
{
	if(this.are_open)
	{
		this.are_open=false;
		this.R.sounds.machine.play();
	}
	this.are_opening=false;
	this.are_closing=true;
};

Gates.prototype.toggle=function()
{
	if(this.are_open || this.are_opening) this.close();
	else this.open();
}

Gates.prototype.draw=function()
{
	if(!this.are_open)
	{
	var cam=this.canvas.getCamera();
	if(this.canvas.isNewFrame()) 
	{
		var ifps=cam.getInverseFPSSmooth();
		
		if(this.are_opening)
		{
			if(this.door_angle<3.68/2)
			{
				this.step1=true;
				this.door_angle+=0.2*ifps;
			}
			else if(this.door_trans<4/5)
			{
				if(this.step1) 
				{
					this.R.sounds.bang2.play();
					this.step1=false;
				}
				this.door_trans+=0.2*ifps;
			}
			else {this.are_open=true;this.are_opening=false;}
		}
		else if(this.are_closing)
		{
			if(this.door_trans>0)
			{
				
				this.step1=false;
				this.door_trans-=0.2*ifps;
			}
			else if(this.door_angle>0)
			{
				if(!this.step1) 
				{
					this.R.sounds.bang1.play();
					this.step1=true;
				}
				this.door_trans=0;
				this.door_angle-=0.2*ifps;
			}
			else {this.door_angle=0;this.are_closing=false;this.R.sounds.bang2.play();}
		}
	}
	var gl=this.canvas.gl;
	gl.disable(gl.DEPTH_TEST);
	
	for(var i=0;i<5;i++)
	{
		cam.pushMatrix();
			cam.rotateY(3.1415/4*(i-2));
			if(this.door_angle<3.68/2)
			{
			cam.pushMatrix();
				cam.translate([0,-1.5/4,-1.2]);
				cam.rotateZ(3.1415);
				cam.rotateX(this.door_angle);
				this.door2.updateShader();
				this.door2.draw();
			cam.popMatrix();
			}
			cam.translate([0,this.door_trans,0]);
			this.door.updateShader();
			this.door.draw();
		cam.popMatrix();
	}
	
	gl.enable(gl.DEPTH_TEST);
	if(this.door_angle<3.68/2)
		return true;
	else 
	{
		return false;
	}
	}else return false;
};


function Level(canvas)
{
	this.num_of_segments=60;
	this.key_frame_freq=5;
	this.circle_freq=1;
	this.res=31;
	this.canvas=canvas;
	this.autoplay=true;
	this.path_maker=new GLObjectMaker(canvas);
	this.disc_maker=new GLObjectMaker(canvas);
	this.comet_maker=new GLObjectMaker(canvas);
	
	//We load all of our files
	var R=this.loadResources();
	
	//--------------------------------------------------------
	//We crate here all our 3D assets to be used in the level:
	//--------------------------------------------------------
	
	//A spherical background
	this.bkg_sphere=new HDRISphere(canvas,35);
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
	object_maker.sphere(7,1,1,1);
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
			object_maker.cylinderX(21,2,2,1);
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
	object_maker.cylinderZ(21,2,2,1);
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

Level.prototype.loadResources=function()
{
	var R=new ResourceManager(this.canvas);
	R.addTexture("matcap2","http://www.visineat.com/js/img/matcap/matcap2.jpg");
	R.addTexture("stars","http://www.visineat.com/js/img/hdri/eso0932a.jpg");
	R.addTexture("matcap","http://www.visineat.com/js/img/matcap/matcap.jpg");
	R.addTexture("mechanical","http://www.visineat.com/js/img/normals/scope_ddna_normals.png");
	R.addTexture("metal5","http://www.visineat.com/js/img/textures/metal5.jpg");
	R.addTexture("planet","http://www.visineat.com/js/img/textures/planet_3_d.jpg");
	R.addSound("bkg_sound","http://www.visineat.com/devs/dev2/intothefire.mp3");
	R.addSound("airplane","airplane_interior.mp3");
	
	R.addVideo("nasa1","11_years_and_counting_-_opportunity_on_mars.mp4");
	R.addVideo("nasa2","nasa_-_greenlands_ice_layers_mapped_in_3d.mp4");
	R.addVideo("nasa3","approaching_titan_a_billion_times_closer.mp4");
	R.addVideo("nasa4","nasas_kepler_discovers_first_earth-size_planet_in_the_habitable_zone_of_another_star.mp4");
	R.addVideo("nasa5","soil_mapping_spacecraft_ready_for_flight.mp4");
	R.addVideo("nasa6","nasa_-_satellite_tracks_saharan_dust_to_amazon_in_3-d.mp4");
	//R.addVideo("nasa7","nasa_-_arctic_sea_ice_sets_new_record_winter_low.mp4");
	//R.addVideo("nasa8","twan0123_h264.mp4");
	
	this.R=R;
	return R;
};

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

function ResourceManager(canvas)
{
	this.canvas=canvas;
	this.textures={};
	this.sounds={};
	this.videos={};
}

ResourceManager.prototype.addTexture=function(name,t)
{
	if(typeof t==='string')
	{
		var i=new GLTexture(this.canvas);i.load(t);
		this.textures[name]=i;
		return i;
	}
	else
	{
		this.textures[name]=t;
		return t;
	}
};

ResourceManager.prototype.addVideo=function(name,t)
{
	if(typeof t==='string')
	{
		var i=new GLTexture(this.canvas);
		this.videos[name]=i.loadVideo(t,{loop:true,autoplay:false});
		this.textures[name]=i;
		return i;
	}
	else
	{
		this.textures[name]=t;
		return t;
	}
};

ResourceManager.prototype.addSound=function(name,s)
{
	if(typeof s==='string')
	{
		var i=new Audio(s);
		i.preload=true;
		this.sounds[name]=i;
		return i;
	}
	else
	{
		this.sounds[name]=s;
		return s;
	}
};