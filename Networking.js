var Networking=function()
{
    this.my_session=null;
	this.me=null;
	this.server=null;
	//this.connect();
	this._p=new VNPromise(this);
}

Networking.prototype.isConnected=function()
{
	if(this.my_session==null)
		return false;
	else return true;
};

Networking.prototype.connect=function()
{
	this.my_session=null;
	this.me=null;
	this.server=new VNServer();
	var self=this;
	
	this.server.whenConnected().otherwise(function(s)
	{
		if(s==self.server)
		{
			console.log('will reconnect...');
			self.server=null;
			self.connect();
		}
	});
	this.server . connect ( 'noreturn demo' ,
	{
		capacity : 0 ,
		releaseSeats : true
	} ) . then ( function ( session )
	{
		self.my_session = session ;
		self.me = self.server . me ( ) ;
	
		vn . getWindowManager ( ) . createNotification ( 'You are now connected!' ) ;
		self._p.callThen();
	} ) ;
};

Networking.prototype.whenConnected=function(){return this._p;};