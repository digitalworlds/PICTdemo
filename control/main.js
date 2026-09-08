var my_program=function()
{
	vn.removeLoadingLogo();
	var area=vn.getScreen();
	
	var left_side=document.createElement('div');
	vn.set(left_side.style,
	{
		position:'absolute',
		width:'30%',
		top:'0px',
		bottom:'0px',
		left:'0px',
		backgroundColor:'green'
	});
	area.appendChild(left_side);
	
	
	var right_side=document.createElement('div');
	vn.set(right_side.style,
	{
		position:'absolute',
		width:'30%',
		top:'0px',
		bottom:'0px',
		right:'0px',
		backgroundColor:'red'
	});
	area.appendChild(right_side);
	
	
	var up=document.createElement('div');
	vn.set(up.style,
	{
		position:'absolute',
		width:'40%',
		top:'0px',
		bottom:'70%',
		left:'30%',
		backgroundColor:'blue'
	});
	area.appendChild(up);
	
	var down=document.createElement('div');
	vn.set(down.style,
	{
		position:'absolute',
		width:'40%',
		top:'70%',
		bottom:'0px',
		left:'30%',
		backgroundColor:'blue'
	});
	area.appendChild(down);
	
	var color=document.createElement('div');
	vn.set(color.style,
	{
		position:'absolute',
		width:'40%',
		top:'30%',
		bottom:'30%',
		left:'30%'
	});
	area.appendChild(color);
	
	var net=new Networking();
	
	var is_pressed=new Array();
	
	net.whenConnected().then(function()
	{
		net.me.p=[Math.random()*3.14-3.14/2,Math.random()-0.5,0,0];
		net.me.variable('p').broadcast();
		
		net.me.clr=[Math.random(),Math.random(),Math.random(),1];
		net.me.variable('clr').broadcast();
		color.style.backgroundColor='rgb('+Math.round(255*net.me.clr[0])+','+Math.round(255*net.me.clr[1])+','+Math.round(255*net.me.clr[2])+')';
		
	});
	
	document.addEventListener('keydown',function(e){
		is_pressed[e.keyCode]=true;
	},false);
	
	document.addEventListener('keyup',function(e){
		is_pressed[e.keyCode]=false;
	},false);
	
	up.addEventListener('touchstart',function()
	{
		is_pressed[38]=true;
	});
	
	up.addEventListener('touchend',function()
	{
		is_pressed[38]=false;
	});
	
	down.addEventListener('touchstart',function()
	{
		is_pressed[40]=true;
	});
	
	down.addEventListener('touchend',function()
	{
		is_pressed[40]=false;
	});
	
	left_side.addEventListener('touchstart',function()
	{
		is_pressed[37]=true;
	});
	
	left_side.addEventListener('touchend',function()
	{
		is_pressed[37]=false;
	});
	
	right_side.addEventListener('touchstart',function()
	{
		is_pressed[39]=true;
	});
	
	right_side.addEventListener('touchend',function()
	{
		is_pressed[39]=false;
	});
	
	var changeColor=function()
	{
		if(!net.isConnected())return;
	
		net.me.clr=[Math.random(),Math.random(),Math.random(),1];
		net.me.variable('clr').broadcast();
		color.style.backgroundColor='rgb('+Math.round(255*net.me.clr[0])+','+Math.round(255*net.me.clr[1])+','+Math.round(255*net.me.clr[2])+')';

	}
	
	color.addEventListener('touchstart',function()
	{
		changeColor();
	});
	
	color.addEventListener('mousedown',function()
	{
		changeColor();	
	});
	
	window.setInterval(function(){  
	
		if(!net.isConnected())return;
	
		if(is_pressed[38])net.me.p[1]+=0.02;
		if(is_pressed[40])net.me.p[1]-=0.02;
		
		if(net.me.p[1]>0.5)net.me.p[1]=0.5;	
		else if(net.me.p[1]<-0.5)net.me.p[1]=-0.5;
		
		if(is_pressed[37])net.me.p[0]+=0.02;
		if(is_pressed[39])net.me.p[0]-=0.02;
	
		if(net.me.p[0]>3.14/2)net.me.p[0]=3.14/2;	
		else if(net.me.p[0]<-3.14/2)net.me.p[0]=-3.14/2;
		
		
		if(is_pressed[37])
		{
			net.me.p[2]+=0.01;
			if(net.me.p[2]>0.5)net.me.p[2]=0.5;
		}
		if(is_pressed[39])
		{
			net.me.p[2]-=0.03;
			if(net.me.p[2]<-0.5)net.me.p[2]=-0.5;
		}
		if(!is_pressed[37]&&!is_pressed[39])
		{
			if(net.me.p[2]>0) 
			{
				net.me.p[2]-=0.01;
				if(net.me.p[2]<0)net.me.p[2]=0;
			}
			else if(net.me.p[2]<0) 
			{
				net.me.p[2]+=0.01;
				if(net.me.p[2]>0)net.me.p[2]=0;
			}
		}
		
		if(is_pressed[38])
		{
			net.me.p[3]+=0.01;
			if(net.me.p[3]>0.5)net.me.p[3]=0.5;
		}
		if(is_pressed[40])
		{
			net.me.p[3]-=0.01;
			if(net.me.p[3]<-0.5)net.me.p[3]=-0.5;
		}
		if(!is_pressed[38]&&!is_pressed[40])
		{
			if(net.me.p[3]>0) 
			{
				net.me.p[3]-=0.01;
				if(net.me.p[3]<0)net.me.p[3]=0;
			}
			else if(net.me.p[3]<0) 
			{
				net.me.p[3]+=0.01;
				if(net.me.p[3]>0)net.me.p[3]=0;
			}
		}
		
		
	
	
		net.me.variable('p').broadcast ({decimals:2 , skip:10}) ;
	}, 1000/60);
	
};