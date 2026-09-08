var loadResources=function(canvas)
{
	var R=new ResourceManager(canvas);
	R.addTexture("matcap2","visineat/js/img/matcap/matcap2.jpg");
	R.addTexture("matcap3","visineat/js/img/matcap/matcap3.jpg");
	R.addTexture("stars","visineat/js/img/hdri/eso0932a.jpg");
	R.addTexture("matcap","visineat/js/img/matcap/matcap.jpg");
	R.addTexture("mechanical","visineat/js/img/normals/scope_ddna_normals.png");
	R.addTexture("metal5","visineat/js/img/textures/metal5.jpg");
	R.addTexture("planet","visineat/js/img/textures/planet_3_d.jpg");
	R.addSound("bkg_sound","visineat/devs/dev2/intothefire.mp3");
	R.addSound("airplane","airplane_interior.mp3");
	
	R.addVideo("nasa1","11_years_and_counting_-_opportunity_on_mars.mp4");
	R.addVideo("nasa2","nasa_-_greenlands_ice_layers_mapped_in_3d.mp4");
	R.addVideo("nasa3","approaching_titan_a_billion_times_closer.mp4");
	R.addVideo("nasa4","nasas_kepler_discovers_first_earth-size_planet_in_the_habitable_zone_of_another_star.mp4");
	R.addVideo("nasa5","soil_mapping_spacecraft_ready_for_flight.mp4");
	R.addVideo("nasa6","nasa_-_satellite_tracks_saharan_dust_to_amazon_in_3-d.mp4");
	//R.addVideo("nasa7","nasa_-_arctic_sea_ice_sets_new_record_winter_low.mp4");
	//R.addVideo("nasa8","twan0123_h264.mp4");
	
	return R;
}; 

function my_program(){
	var area=vn.getScreen();
	area.addEventListener("click", () => {
    my_program2();
});

}

function my_program2()
{
	vn.removeLoadingLogo();
	var area=vn.getScreen();
	var c=new GLCanvas(area);
	c.createHeaders();
	c.setSubTitle('');
	c.setTitleOpacity(1);
	
	//c.onOrientationChange=function(e){c.getCamera().updatePerspective(e);};

	var level=null;
	var gates=null;
	var jet=null;
	 
	c.whenDragged().then(function(o,e){ if(e.object==r_button || e.object==l_button)return;if(e.dx.length==1)c.getCamera().oneFingerRotate(e,{radius:0,type:'polar',speed:1});c.getCamera().twoFingerRotate(e);});
	
	c.whenTapped().then(function(o,e){ if(e.object!=null)return;gates.toggle();level.pause();});
	
	var angle=0;
	var t=0;
	var brake=false;
	var autovideo=true;
	var bkg_volume=0;
	var bkg_volume_dir=0;
	
	
	c.whenKeyPressed().then(function(keyCode)
	{
		if(keyCode==37)//LEFT
			l_button.pressed=true;
		if(keyCode==39)//RIGHT
			r_button.pressed=true;
		if(keyCode==32) {gates.toggle();level.pause();}
		if(keyCode==40){brake=!brake;if(brake){l_button.speed=0;r_button.speed=0;}}
		if(keyCode==86){autovideo=!autovideo;level.autoPlayVideos(autovideo);
			if(autovideo)
			{
				bkg_volume_dir=-1;
			}
			else
			{
				bkg_volume_dir=1;
				level.R.sounds.airplane.play();
			}
		}
	});
	
	c.whenKeyReleased().then(function(keyCode)
	{
		if(keyCode==37)//LEFT
			l_button.pressed=false;
		if(keyCode==39)//RIGHT
			r_button.pressed=false;
		if(keyCode==38)brake=false;
	});
	
	var l_button=null;
	var r_button=null;
	c.whenStarted().then(function()
	{
		//We load all of our files
		var R=loadResources(c);
		
		gates=new Gates(c);
		level=new Level(c,R);
		jet=new Jet(c,R);
		level.R.sounds.airplane.pause();
		c.whenKeyPressed().callThen({object:86});
		
		t=level.getPosition();
		 
		var gui_maker=new GLObjectMaker(c);
		var gui_shader=new GLShader(c,0);
		gui_shader.setColorMask([1,1,1,0]);
		gui_maker.translate([0,0,-0.1]);
		
		gui_maker.rect(1,1);
		l_button=gui_maker.flush();
		l_button.setShader(gui_shader);
		l_button.onTouch=function(e){l_button.pressed=true;};
		l_button.onTouchEnd=function(e){l_button.pressed=false;};
		l_button.speed=0;
		
		gui_maker.rect(1,1);
		r_button=gui_maker.flush();
		r_button.setShader(gui_shader);
		r_button.onTouch=function(e){r_button.pressed=true;};
		r_button.onTouchEnd=function(e){r_button.pressed=false;};
		r_button.speed=0;
		
		c.setLoadingStatus(false);
		c.usePolygonalTheaterProjector(45,5);
		//c.getCamera().setFOV(60);
	});
	
	var song_plays=false;
	
	c.whenAnimate().then(function(){
		if(net.isConnected())
		{
			var users = net.my_session.getUsers( ) ;
			for ( var i in users )
			{
				if(users[i].p) users[i].variable('p').interpolate(10);
			}
		}
	});
	
	c.whenDraw().then(function()
	{
		var gl=c.getGL();
		var cam=c.getCamera();
		var ifps=cam.getInverseFPSSmooth();
		if(gates.canMove())
		{
			if(!song_plays){song_plays=true; level.R.sounds.bkg_sound.currentTime=0;level.R.sounds.bkg_sound.play();}
			if(c.isNewFrame())
			{
				if(!brake)
				{
				if(l_button.pressed) {angle-=1*ifps;l_button.speed+=1*ifps;if(l_button.speed>2)l_button.speed=2;t+=l_button.speed*ifps;}
				else{l_button.speed-=0.3*ifps;if(l_button.speed<0)l_button.speed=0;t+=l_button.speed*ifps;}
				if(r_button.pressed) {angle+=1*ifps;r_button.speed+=1*ifps;if(r_button.speed>2)r_button.speed=2;t+=r_button.speed*ifps;}
				else{r_button.speed-=0.3*ifps;if(r_button.speed<0)r_button.speed=0;t+=r_button.speed*ifps;}
				angle+=0.04*ifps;
				t+=0.3*ifps;
				}
			}
		}
		else if(song_plays){song_plays=false; level.R.sounds.airplane.pause();}
		
		
		if(c.isNewFrame())
		{
			if(bkg_volume_dir!=0)
			{
				bkg_volume+=bkg_volume_dir*0.5*ifps;
				if(bkg_volume>1){bkg_volume=1;bkg_volume_dir=0;}
				else if(bkg_volume<0){bkg_volume=0;bkg_volume_dir=0;level.R.sounds.airplane.pause();level.R.sounds.bkg_sound.pause();}
				level.R.sounds.airplane.volume=bkg_volume;
				level.R.sounds.bkg_sound.volume=bkg_volume;
			}
		}
		
		level.draw(t,angle);
		
		if(net.isConnected())
		{
			var users = net.my_session.getUsers( ) ;
			for ( var i in users )
				jet.draw(users[i].p,users[i].clr);
		}
		
		gates.draw();
		//draw the gui on the top of everything
		gl.disable(gl.DEPTH_TEST);
		cam.identity();
		cam.scale([cam.screen_height2*2,cam.screen_height2*2,1]);
		cam.pushMatrix();
			cam.translate([cam.getAspectRatio()*(-1+0.2)/2,0,0]);
			cam.scale([cam.getAspectRatio()*0.2,1,1]);
			l_button.updateShader();
			l_button.draw();
		cam.popMatrix();
		cam.pushMatrix();
			cam.translate([cam.getAspectRatio()*(1-0.2)/2,0,0]);
			cam.scale([cam.getAspectRatio()*0.2,1,1]);
			r_button.updateShader();
			r_button.draw();
		cam.popMatrix();
		gl.enable(gl.DEPTH_TEST);
		
		//print out the current FPS and scene complexity 
		if(c.isNewFrame())c.setTitle('&nbsp;&nbsp;&nbsp;&nbsp;'+Math.round(c.getCamera().getFPSSmooth())+'fps '+c.getNumOfVertices()+' vertices '+c.getNumOfElements()+' faces');
	});
	
	var net=new Networking();
	
	c.start();	
}