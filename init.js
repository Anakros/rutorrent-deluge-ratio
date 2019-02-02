plugin.loadLang();

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0.00 KiB';
   var k = 1024,
       dm = decimals <= 0 ? 0 : decimals || 2,
       sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toLocaleString(undefined, {minimumFractionDigits: dm, maximumFractionDigits: dm})) + ' ' + sizes[i];
}

if(plugin.canChangeColumns())
{
	plugin.config = theWebUI.config;
	theWebUI.config = function(data)
	{
		this.tables.trt.columns.push({text: 'DlgRatio', width: '100px', id: 'dratio', type: TYPE_NUMBER});
		this.tables.trt.columns.push({text: 'TotalRatio', width: '100px', id: 'tratio', type: TYPE_NUMBER});
		this.tables.trt.columns.push({text: 'TotalUpload', width: '100px', id: 'tupload', type: TYPE_NUMBER});
		plugin.trtFormat = this.tables.trt.format;
		plugin.config.call(this,data);
		plugin.reqId1 = theRequestManager.addRequest("trt", theRequestManager.map("d.get_custom=")+"deluge_ratio",function(hash,torrent,value)
		{
			torrent.dratio = Number(value).toLocaleString(undefined, {minimumFractionDigits: 3});
		});
		plugin.reqId2 = theRequestManager.addRequest("trt", theRequestManager.map("d.get_ratio="),function(hash,torrent,value)
		{
			total = Number(value)/1000 + Number(torrent.dratio);
			torrent.tratio = total.toLocaleString(undefined, {minimumFractionDigits: 3});
		});
		plugin.reqId3 = theRequestManager.addRequest("trt", theRequestManager.map("d.get_size_bytes="),function(hash,torrent,value)
		{
			total = Number(torrent.tratio) * value;
			torrent.tupload = formatBytes(total, 2);
		});
		plugin.trtRenameColumn();
	}

	plugin.trtRenameColumn = function()
	{
		if(plugin.allStuffLoaded)
		{
			theWebUI.getTable("trt").renameColumnById("dratio",theUILang.dratio);
			theWebUI.getTable("trt").renameColumnById("tratio",theUILang.tratio);
			theWebUI.getTable("trt").renameColumnById("tupload",theUILang.tupload);
			if(thePlugins.isInstalled("rss"))
				plugin.rssRenameColumn();
			if(thePlugins.isInstalled("extsearch"))
				plugin.tegRenameColumn();
		}
		else
			setTimeout(arguments.callee,1000);
	}

	plugin.rssRenameColumn = function()
	{
		if(theWebUI.getTable("rss").created)
		{
			theWebUI.getTable("rss").renameColumnById("dratio",theUILang.dratio);
			theWebUI.getTable("rss").renameColumnById("tratio",theUILang.tratio);
			theWebUI.getTable("rss").renameColumnById("tupload",theUILang.tupload);
		}
		else
			setTimeout(arguments.callee,1000);
	}

	plugin.tegRenameColumn = function()
	{
		if(theWebUI.getTable("teg").created)
		{
			theWebUI.getTable("teg").renameColumnById("dratio",theUILang.dratio);
			theWebUI.getTable("teg").renameColumnById("tratio",theUILang.tratio);
			theWebUI.getTable("teg").renameColumnById("tupload",theUILang.tupload);
		}
		else
			setTimeout(arguments.callee,1000);
	}
}

plugin.onRemove = function()
{
	theWebUI.getTable("trt").removeColumnById("dratio");
	theWebUI.getTable("trt").removeColumnById("tratio");
	theWebUI.getTable("trt").removeColumnById("tupload");
	if(thePlugins.isInstalled("rss"))
	{
		theWebUI.getTable("rss").removeColumnById("dratio");
		theWebUI.getTable("rss").removeColumnById("tratio");
		theWebUI.getTable("rss").removeColumnById("tupload");
	}
	theRequestManager.removeRequest( "trt", plugin.reqId1 );
	theRequestManager.removeRequest( "trt", plugin.reqId2 );
	theRequestManager.removeRequest( "trt", plugin.reqId3 );
}
