var UI = require('ui');
var ajax = require('ajax');

var splash = new UI.Card({
	title: 'WebCoast 2015',
	subtitle: 'Laddar...' //,
	//icon: 'images/Webcoast.png'
});

splash.show();


var parseProgram = function(data) {
	var days={'dag-1': 'Fredag', 'dag-2':'Lördag', 'dag-3':'Söndag'};
	var items = {};
	for (var day in data) {
		if (data.hasOwnProperty(day)) {
			var dayname=days[day];
			
			items[dayname] = [];
			for(var item in data[day]){
				var date = new Date(data[day][item].start_time.replace(' ', 'T').replace(' +0000', '+01:00')),
				times = date.toTimeString().split(' ')[0].split(':');
				
				items[dayname].push({
					title: times[0] + ':' + times[1],
					subtitle: data[day][item].title,
					date: date
				}); 
			}
		
			items[dayname] = items[dayname].sort(function(a, b) {
				return a.date - b.date;
			});
		}
	}
	
	return items;
};
ajax(
	{
		url: 'http://www.webcoast.se/program/json/',
		type: 'json'
	},
	function(data) {
		// Success!
		var menuItems = parseProgram(data);
		var daysMenuItems=[];
		for (var day in menuItems) {
			if (menuItems.hasOwnProperty(day)) {
				daysMenuItems.push({
					title:day
				});
			}
		}
		
		var daysMenu = new UI.Menu({
			sections: [{
				title: 'WebCoast 2015',
				items: daysMenuItems
			}]
		});
		
		// Add an action for SELECT
		daysMenu.on('select', function(e) {
			var dayNameClicked = daysMenuItems[e.itemIndex].title;
			var programMenuItems = menuItems[dayNameClicked];
			
			// Create program menu for day
			var programMenu = new UI.Menu({
				sections: [{
					title: daysMenuItems[e.itemIndex].title,
					items: programMenuItems
				}]
			});
			programMenu.show();
		
	
			// Add an action for SELECT
			programMenu.on('select', function(e) {
				var program = data['dag-1'][e.itemIndex];
	
				// Assemble body string
				var content = program.title + '\n\n' + program.content;
	
				// Create the Card for detailed view
				var detailCard = new UI.Card({
					title       : program.room.room_name,
					subtitle    : e.item.title,
					body        : content,
					scrollable  : true
				});
				detailCard.show();
			});
		});

		// Show the Menu, hide the splash
		daysMenu.show();
		splash.hide();
	},
	function(error) {
		// Failure!
		console.log('Kunde inte hämta: ' + error);
	}
);
