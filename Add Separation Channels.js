// Add index channels from palette to sepFile

// Put header files in a "Stack Scripts Only" folder.  The "...Only" tells
// PS not to place it in the menu.  For that reason, we do -not- localize that
// portion of the folder name.

// var HISTORY_STEP_NAME = "Add Separation Channels";
// Doc.suspendHistory(HISTORY_STEP_NAME, "main()");

// Check if there's an open file
if (app.documents.length > 0) {
	var Doc = app.activeDocument;
	var promptResult = initialPrompt();
} else {
	alert("Error:\nNo file's are open.")
}

// ==============================================
// Custom dialog to select sepFile and paletteFile
// ==============================================
function initialPrompt () {

	var documentsArray = app.documents;
	var sepFile = Doc;
	var paletteFile = Doc;
	var numberOfColors = 13;

	// Window Creation //
	var w = new Window('dialog', 'Example', undefined, undefined);
	var sepFileDropdownGroup = w.add('group');
		sepFileDropdownGroup.alignment = 'left';
		var sepFileStatictext = sepFileDropdownGroup.add('statictext', undefined, 'sepFile:');
		sepFileStatictext.size = [78, 16];
		var sepFileDropdown = sepFileDropdownGroup.add('dropdownlist', undefined, documentsArray);
			// Select the current document in the dropdown
			sepFileDropdown.selection = (function () {
				var docs = app.documents; var doc = app.activeDocument; var index = 0;
				for (var i = 0; i < docs.length; i++) {  
					if (docs[i] == doc) { index = i; }	  
				}
				return index;
			}) ();
	var paletteFileDropdownGroup = w.add('group')
		paletteFileDropdownGroup.alignment = 'left';
		var paletteFileStatictext = paletteFileDropdownGroup.add('statictext', undefined, 'paletteFile:');
		paletteFileStatictext.size = [78, 16];
		var paletteFileDropdown = paletteFileDropdownGroup.add('dropdownlist', undefined, documentsArray);
	var numberOfColorsDropdownGroup = w.add('group')
		numberOfColorsDropdownGroup.alignment = 'left';
		var numberOfColorsStatictext = numberOfColorsDropdownGroup.add('statictext', undefined, 'Colors:');
		numberOfColorsStatictext.size = [78, 16];
		var numberOfColorsDropdown = numberOfColorsDropdownGroup.add('dropdownlist', undefined, [1,2,3,4,5,6,7,8,9,10,11,12,13]);
		numberOfColorsDropdown.selection = 12;
	var buttonGroup = w.add('group')
		buttonGroup.alignment = 'right';
		var okButton = buttonGroup.add('button', undefined, 'OK');
		var cancelButton = buttonGroup.add('button', undefined, 'Cancel');

	// BUTTON FUNCTIONS
	okButton.onClick = function () {
		if ( null != sepFileDropdown.selection ){
			sepFile = documentsArray[sepFileDropdown.selection.index];
		}
		if ( null != paletteFileDropdown.selection ){
			paletteFile = documentsArray[paletteFileDropdown.selection.index];
		}
		numberOfColors = (numberOfColorsDropdown.selection.index + 1);
		originalUnits = app.preferences.rulerUnits;
		app.preferences.rulerUnits = Units.PIXELS;
		addColorsToSepFile( sepFile, collectPaletteColors(paletteFile, numberOfColors) );
		app.preferences.rulerUnits = originalUnits;

		return w.close();
	}
	cancelButton.onClick = function () { return w.close(); }

	w.show();
}

// ==============================================
// Collect collors from the paletteFile
// ==============================================
function collectPaletteColors ( paletteFile, numberOfColors ) {
	// alert('PaletteFile Selected is:\n'+paletteFile.name);
	app.activeDocument = paletteFile;
	paletteFile.suspendHistory(
		'Color Collection for Separation',
		'thisColorCollection = clutOperations( new Array() )'
		);

	// paletteFileMain() essentially, needs to be enclosed for sake of suspended history
	function clutOperations (thisColorCollection) {
		for (i = 0; i<numberOfColors; i++) {
			thisColorCollection[i] = getColorOfPixelAt((i%10)+0.5, (Math.floor(i/10)+0.5));
			paletteFile.colorSamplers.removeAll();
		}
		return thisColorCollection;
	}
	// Helper Function to grab pixel colors at specified coordinates
	function getColorOfPixelAt( xCoordinate, yCoordinate ) {
		paletteFile.activeChannels = paletteFile.componentChannels;
		var theSampler = new SolidColor();
		try {
		   	theSampler = paletteFile.colorSamplers.add([xCoordinate, yCoordinate]);
	    } catch (e) { /* DO NOTHING */ }
	   	return theSampler.color;
	}

	return thisColorCollection ;
}

// ==============================================
// Add all paletteColors to channels in sepFile
// ==============================================
function addColorsToSepFile ( sepFile, paletteColors ) {
	// alert('sepFile Selected is:\n'+sepFile.name);
	app.activeDocument = sepFile;
	sepFile.suspendHistory(
		'Add Separation Channels',
		'sepFileMain(paletteColors)'
		);

	// Needs to be enclosed for sake of suspended history
	function sepFileMain ( paletteColors ) {

		// prompt to sort paletteColors
	// 	sortedPaletteColors = sortPrompt(paletteColors);
		// add Color Channels
		var length = paletteColors.length;
		for (i = 0; i<length; i++) {
			addChannel(paletteColors[i]);
		}

		// ==========================
		// Prompt for manual sorting
		// ==========================
		function sortPrompt ( inputArray ) {

			var w = new Window('dialog {text: "Sort Colors", alignChildren: "fill"}');
				w.entry = w.add('edittext {active: true}');
				w.list = w.add('listbox', [0, 0, 150, 250], inputArray);
					w.list.selection = 0;
				buttonGroup = w.add('group')
					buttonGroup.alignment = 'right';
					okButton = buttonGroup.add('button', undefined, 'OK');
					cancelButton = buttonGroup.add('button', undefined, 'Cancel');
					// populate w.list with all the colors
			for ( i=0; i<inputArray.length; i++) {
				if (inputArray[i].toLowerCase().indexOf (temp) == 0) {
					list.add ('item', colorsArray[i]);
				}
			}

			if (w.show() === 1) {
				return inputArray;
			} else {
				// Sort the incoming colors lightest to darkest;
				// /////////////////////////////////////////////
				inputArray.sort(function (a, b) {
					// return (b.lab.l - a.lab.l)
					return ((b.lab.l * 10)+b.hsb.brightness) - ((a.lab.l * 10)+a.hsb.brightness);
				});
				return inputArray;
			}
		}
	}

	function addChannel ( inputColor ) {
		var ChannelRef = sepFile.channels.add();
		ChannelRef.opacity = 100;
		ChannelRef.color = inputColor;
		ChannelRef.kind = ChannelType.SELECTEDAREA;
		ChannelRef.kind = ChannelType.SPOTCOLOR;
		ChannelRef.name = whatColorIsThis(inputColor);
	}
	

}



//////////////////////////////////////////////////
// REUSABLE CODE TO AUTOMATICALLY GENERATE
// A NAME FOR AN INPUT COLOR ( FROM PHOTOSHOP )
//////////////////////////////////////////////////
function whatColorIsThis ( solidColor ) {
	var h = solidColor.hsb.hue;
	var s = solidColor.hsb.saturation;
	var b = solidColor.hsb.brightness;
	// var s8 = Math.Floor((s/100)*255)+1
	// var b8 = Math.Floor((b/100)*255)+1

	// Anything below 10 Brightness = BLACK
	if (b < 10) {
		return "Black";
	// Anything less saturated than 15 and brighter than 98
	// is 'white' enough to be called white
	} else if (s < 15 && b > 98) {
		return "White";
	} else {
		var colorString = new Array();
		if (s <= 20) {
			colorString.push("Gray");
		} else {
			if (h >= 0 && h <= 10) {
				colorString.push("Red");
			} else if ( h > 10 && h <= 20) {
				colorString.push("Red-Orange");
			} else if ( h > 20 && h <= 40) {
				colorString.push("Orange");
			} else if ( h > 40 && h <= 50) {
				colorString.push("Yellow-Orange");
			} else if ( h > 50 && h <= 60) {
				colorString.push("Yellow");
			} else if ( h > 60 && h <= 80) {
				colorString.push("Yellow-Green");
			} else if ( h > 80 && h <= 140) {
				colorString.push("Green");
			} else if ( h > 140 && h <= 170) {
				colorString.push("Aqua");
			} else if ( h > 170 && h <= 190) {
				colorString.push("Cyan");
			} else if ( h > 190 && h <= 220) {
				colorString.push("Sky-Blue");
			} else if ( h > 220 && h <= 265) {
				colorString.push("Blue");
			} else if ( h > 265 && h <= 310) {
				colorString.push("Purple");
			} else if ( h > 310 && h <= 320) {
				colorString.push("Magenta");
			} else if ( h > 320 && h <= 345) {
				colorString.push("Pink");
			} else if ( h > 345 && h <= 360) {
				colorString.push("Red");
			} else {
				colorString.push("Color");
			}

			if (s > 20 && s <= 50) {
				colorString.unshift("Grayish")
			}
		}

		if (b < 20) {
			colorString.unshift("Dark");
		} else if (b > 80 && s < 80) {
			colorString.unshift("Light")
		}
		
		return colorString.join(' ');
	}
}