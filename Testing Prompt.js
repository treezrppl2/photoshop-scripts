alert(sortPrompt(["Purple","Red","Yellow","Green","Orange","Blue"]))

function sortPrompt (myArray) {
	var savedState = {
		foregroundColor: app.foregroundColor,
		backgroundColor: app.backgroundColor
	};

	var w = new Window(
			'dialog {\
				text: "Colors:",\
				alignChildren: "left",\
				}\
			}');
			var tempChannelsGroup = w.add('group');
				tempChannelsGroup.orientation = 'column';
				tempChannelsGroup.alignChildren = 'left';
				
			// we need a way to access individual temp-channels
			var colorControllerArray = new Array();
			for(i=0;i<myArray.length;i++){
				colorControllerArray[i] = tempChannelsGroup.add('group');
				colorControllerArray[i].swatch = colorControllerArray[i].add('button', [0,0,28,21], '█');
				colorControllerArray[i].swatch.minimumSize = [28,21];
				colorControllerArray[i].swatch.maximumSize = [28,21];
				// this doesn't actually change the color of anything.
				colorControllerArray[i].swatch.foregroundColor = w.graphics.newBrush( w.graphics.BrushType.SOLID_COLOR,[1.0,1.0,0.0,1.0], 1);
				colorControllerArray[i].swatch.onClick = function () {
					app.showColorPicker();
					// apply app.foregroundcolor to array[i].color and button.foregroundcolor

					// reset app.foregroundColor to savedState.foregroundColor
				}
				colorControllerArray[i].alignChildren = 'left';
				colorControllerArray[i].colorName = colorControllerArray[i].add('editText', undefined, myArray[i]);
				colorControllerArray[i].colorName.characters = 20;
				colorControllerArray[i].buttons = colorControllerArray[i].add('group');
				colorControllerArray[i].buttons.moveUp = colorControllerArray[i].buttons.add('button', [0,0,25,21], '↑');
				colorControllerArray[i].buttons.moveUp.maximumSize = colorControllerArray[i].buttons.moveUp.minimumSize = [25, 21];
					i==0? colorControllerArray[i].buttons.moveUp.enabled = false : null;
					// colorControllerArray[i].buttons.moveUp.
				colorControllerArray[i].buttons.moveDown = colorControllerArray[i].buttons.add('button', [0,0,21,21], '↓');
				colorControllerArray[i].buttons.moveDown.maximumSize = colorControllerArray[i].buttons.moveDown.minimumSize = [25, 21];
					i==myArray.length-1? colorControllerArray[i].buttons.moveDown.enabled = false : null;
			}


	// buttons
	if (w.show () != 2){
		return "list.items:\n" + myArray.join('\n');
	} else {
		return "list.items:\nnull";
	}
	w.close();

	app.foregroundColor = savedState.foregroundColor;
	app.backgroundColor = savedState.backgroundColor;

	function moveSelection () {
		// need to be reworked for current implementation. taken directly from a different context.
		// specifically 'this' no longer applies in the same manner as 'this' needs to refer to a group
		// a group which cannot be the caller of a the current function in the needed manner.
		var temp = list.selection.text;
		var tempforMyArray = myArray[list.selection.index];
		list.items[list.selection.index].text = list.items[list.selection.index + this.increment].text;
		myArray[list.selection.index] = myArray[list.selection.index + this.increment];
		list.items[list.selection.index + this.increment].text = temp;
		myArray[list.selection.index+this.increment] = tempforMyArray;
		list.selection+=this.increment;
	}
}