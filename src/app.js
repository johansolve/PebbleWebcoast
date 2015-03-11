var UI = require('ui');
var ajax = require('ajax');

var splash = new UI.Card({
	title: 'WebCoast',
	subtitle: 'Laddar...' //,
	//icon: 'images/Webcoast.png'
});

splash.show();


var parseProgram = function(data, maxitems) {
	var items = [];
	
	for(var i = 0; i < maxitems; i++) {
		var item = data['dag-1'][i];
		var dt=item.start_time;
		// Gör om 2015-03-13 23:00:00 +0000 
		// till 2015-03-13T23:00:00+01:00 
		dt = dt.replace(' ', 'T').replace(' +0000', '+01:00');
		var d=new Date(dt);
		var time=(d.getHours() <= 9 ? '0':'') + d.getHours() + ':' + (d.getMinutes() <= 9 ? '0':'') + d.getMinutes();

		// Add to menu items array
		items.push({
			title:time,
			subtitle:item.title
		});
	}

	// Finally return whole array
	return items;
};
ajax(
	{
		url: 'http://www.webcoast.se/program/json/',
		type: 'json'
	},
	function(data) {
		// Success!
		var menuItems = parseProgram(data, 10);
		// Construct Menu to show to user
	var resultsMenu = new UI.Menu({
			sections: [{
				title: 'Program',
				items: menuItems
			}]
		});
	
		// Add an action for SELECT
		resultsMenu.on('select', function(e) {
			// Get that forecast
			var program = data['dag-1'][e.itemIndex];

			// Assemble body string
			var content = program.title + '\n\n' + program.content;

			// Create the Card for detailed view
			var detailCard = new UI.Card({
				title:program.room.room_name,
				subtitle:e.item.title,
				body: content,
				scrollable: true
			});
			detailCard.show();
		});

		// Show the Menu, hide the splash
		resultsMenu.show();
		splash.hide();
	},
	function(error) {
		// Failure!
		console.log('Kunde inte hämta: ' + error);
	}
);


