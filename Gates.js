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