var ViennaModel = {
	locations: [
		{
			name: 'WW2 Flak Tower',
			coordinates: {lat: 48.22563, lng: 16.372815},
			wikiPageID: 1369643,
			officialWikiTitle: null,
			wikiUrl: 'Flak_tower'
		},
		{
			name: 'Vienna Rose Garden',
			coordinates: {lat: 48.208056, lng: 16.361111},
			wikiPageID: 22533198,
			officialWikiTitle: null,
			wikiUrl: 'Volksgarten,_Vienna'

		},
		{
			name: "Mozart's House",
			coordinates: {lat: 48.207778, lng: 16.375278},
			wikiPageID: 28369776,
			officialWikiTitle: null,
			wikiUrl: 'Mozarthaus_Vienna'
		},
		{
			name: 'Schonbrunn Palace',
			coordinates: {lat: 48.184516, lng: 16.311865},
			wikiPageID: 165202,
			officialWikiTitle: null,
			wikiUrl: 'Schönbrunn_Palace'
		},
		{
			name: 'Vienna State Opera',
			coordinates: {lat: 48.202778, lng: 16.369111},
			wikiPageID: 379066,
			officialWikiTitle: null,
			wikiUrl: 'Vienna_State_Opera'
		},
		{
			name: 'Hofburg Palace',
			coordinates: {lat: 48.206507, lng: 16.365262},
			wikiPageID: 1651794,
			officialWikiTitle: null,
			wikiUrl: 'Hofburg'
		},
		{
			name: 'Museum of Military History',
			coordinates: {lat: 48.185278, lng: 16.3875},
			wikiPageID: 2680555,
			officialWikiTitle: null,
			wikiUrl: 'Museum_of_Military_History,_Vienna'
		}
	]
};


function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	vm.map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 48.205, lng: 16.366667},
		zoom: 13,
		mapTypeControl: false
	});
	vm.makeMarkers();
	infoWindow1 = new google.maps.InfoWindow({});
}


/**
* @description Displays an error message if the Goolge Maps API is unreachable
*/
function googleError() {
	var errorMsg = '<div>Error - Google Maps cannot be reached</div>';
	$('#map').append(errorMsg);
}


/**
* @description Creates an infowindow pop-up on the map portion of the screen
* providing information about the item which has been clicked on (and
* subsequently passed to this function). The information to be displayed is
* retrieved from Wikipedia's API.
* @param {object} marker - Google Maps location marker
*/
function populateInfoWindow(marker) {
	var wikiPageURL = 'https://en.wikipedia.org/w/api.php?action=query&' +
        'format=json&prop=extracts&pageids=' + marker.summaryID +
        '&exintro=1';
	//  Build a timeout function for error handling of the JSON-P request to wikipedia, help can be found here:
	//  https://classroom.udacity.com/nanodegrees/nd004/parts/135b6edc-f1cd-4cd9-b831-1908ede75737/modules/271165859175460/lessons/3310298553/concepts/31621285920923
	var wikiRequestTimeout = setTimeout(function() {
		infoWindow1.setContent('<h3 id="location-title">' + marker.title +
            '</h3><div>(Failed to get Wikipedia Resources)</div>');
		marker.setAnimation(google.maps.Animation.DROP);
		infoWindow1.open(map, marker);
	}, 2000);

	$.ajax({ url : wikiPageURL, dataType : 'jsonp',
		success : function(response) {
			var wikiSummary = response['query']['pages'][marker.summaryID]
                ['extract'];
			infoWindow1.setContent('<h3 id="location-title">' + marker.title +
                '</h3><div id="summary">' + wikiSummary + '</div>' +
				'<div id="attribution">' + 'Information retrieved from ' +
				'<a href="https://en.wikipedia.org/wiki/' + marker.url +
				'">' + marker.title + '</a> page on ' +
				'<a href="https://www.wikipedia.org/">' +
				'Wikipedia' + '</a></div>');
			marker.setAnimation(google.maps.Animation.DROP);
			infoWindow1.open(map, marker);
			clearTimeout(wikiRequestTimeout);
		}
	});
}


/**
* @description Click event listener on the listview items. Will call program
* to display information on the map about the clicked item.
*/
function listviewClickListener(data, event) {
	populateInfoWindow(data.marker);
}


/**
* @description Listens for any user changes to the content of the textbox
* and upon any change, updates the markers on the map so that only those
* matching the filter are displayed.
*/
$('#Inputer').on('change paste keyup', function() {  //  Conditionally display markers on the map.
	for (var k = 0; k < vm.viennaList().length; k++ ) {  //  Make all markers invisible
		vm.viennaList()[k].marker.setMap(null);
	}
   	for (var i = 0; i < vm.newFilteredList().length; i++) {
		for (var j = 0; j < vm.viennaList().length; j++ ) {
			if (vm.viennaList()[j].marker.summaryID
                    === vm.newFilteredList()[i].wikiPageID) {
				vm.viennaList()[j].marker.setMap(vm.map);  //  Make marker visibile if it is visible in the List-View
			}
		}
   	}
});


/**
* @description Represents the ViewModel which controls flow of events
* @constructor
*/
var ViewModel = function() {
	var self = this;
	self.viennaList = ko.observableArray();
	for (var i = 0; i < ViennaModel.locations.length; i++) {
		self.viennaList.push(ViennaModel.locations[i]);
	}

	self.userText = ko.observable('');
	self.newFilteredList = ko.computed(function() {
		if (!self.userText()) {
			// Return the original array if there is no user input
			return self.viennaList();
		} else {
			//  Filtering mechanism, returns the filtered array here
			return ko.utils.arrayFilter(self.viennaList(), function(item) {
				//  Returns true if the user input string is found in the name
				//  of the current item being passed, (case insensitive)
				return (item.name.search(new RegExp(self.userText(),
                    'i')) > -1);
			});
		}
	});

	self.makeMarkers = function() {
		var markers = [];
		for (var i = 0; i < self.viennaList().length; i++) {
			self.viennaList()[i].marker = new google.maps.Marker({
				position: new google.maps.LatLng(self.viennaList()[i]
                    ['coordinates']['lat'],
                    self.viennaList()[i]['coordinates']['lng']),
				map: vm.map,
				visible: true,
				title: self.viennaList()[i].name,
				summaryID: self.viennaList()[i].wikiPageID,
				id: i,
				url: self.viennaList()[i].wikiUrl
			});
			self.viennaList()[i].marker.addListener('click', function() {
				populateInfoWindow(this);
			});
		}
	};
};


var vm = new ViewModel();

ko.applyBindings(vm);
