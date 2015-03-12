var UI = require('ui');
var ajax = require('ajax');

// Startkort
var splash = new UI.Card({
	title	  : 'WebCoast 2015',
	body	  : 'Laddar...'
});

splash.show();


// Funktion för att bearbeta programmet som hämtats i JSON-format
var parseProgram = function(data) {
	var days={'dag-1': 'Fredag', 'dag-2':'Lördag', 'dag-3':'Söndag'};
	var items = {};
	for (var day in data) {
		if (data.hasOwnProperty(day)) {
			var dayname=days[day];
			
			items[dayname] = [];
			for(var item in data[day]){
				if (data[day].hasOwnProperty(item)) {
					// Gör om 2015-03-13 23:00:00 +0100 
					// till 2015-03-13T23:00:00+01:00 
					var date = new Date(data[day][item].start_time.replace(' ', 'T').replace(' +0100', '+01:00').replace(' +0000', '+01:00'));
					var times = date.toTimeString().split(' ')[0].split(':');
					items[dayname].push({
						title		 : times[0] + ':' + times[1],
						subtitle	 : data[day][item].title,
						date		 : date,
						eventData	 : data[day][item] // all data om programpunken
					});
				}
			}
			// Sortera efter klockslag
			items[dayname] = items[dayname].sort(function(a, b) {
				return a.date - b.date;
			});
		}
	}
	return items;
};

// Hämta programmet med Ajax
ajax(
	{
		url: 'http://www.webcoast.se/program/json/',
		type: 'json'
	},
	function(data) {
		// Success!
		// Bearbeta svaret
		var menuItems = parseProgram(data);
		
		// Skapa menyvalen för första menyn, för att visa dagarna
		var daysMenuItems=[];
		for (var day in menuItems) {
			if (menuItems.hasOwnProperty(day)) { // dyk inte in i ärvda properties
				daysMenuItems.push({
					title : day
				});
			}
		}
		// Skapa första menyn
		var daysMenu = new UI.Menu({
			sections: [{
				title: 'WebCoast 2015',
				items: daysMenuItems
			}]
		});
		
		// Visa menyn, göm startfönstret
		daysMenu.show();
		splash.hide();

		// Hantera menyval
		daysMenu.on('select', function(e) {
			// Hämta den valda dagen och menyvalen för den dagen
			var dayNameClicked = daysMenuItems[e.itemIndex].title;
			var programMenuItems = menuItems[dayNameClicked];
			
			// Skapa andra menyn
			var programMenu = new UI.Menu({
				sections: [{
					title: daysMenuItems[e.itemIndex].title,
					items: programMenuItems
				}]
			});

			// visaVisa menyn
			programMenu.show();
		
	
			// Hantera menyval
			programMenu.on('select', function(e) {
				// Hämta vald programpunkt
				var program = programMenuItems[e.itemIndex].eventData;
	
				// Bygg upp innehållet
				var content = program.title + '\n\n' + program.content;
	
				// Skapa kort för programinnehållet
				var detailCard = new UI.Card({
					title		: program.room.room_name,
					subtitle	: e.item.title,
					body		: content,
					scrollable	: true
				});

				// Visa programkortet
				detailCard.show();
			});
		});

	},
	function(error) {
		// Failure!
		// Något gick fel med Ajax-hämtningen
		console.log('Kunde inte hämta: ' + error);
	}
);
