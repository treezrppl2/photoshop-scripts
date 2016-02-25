// Copies the selected channel names to the clipboard while
// expanding commonly used abbreviations

var doc = app.activeDocument
var swatches = doc.activeChannels
var swatchNames = ""
var l = swatches.length

for(var i=0,len=l;i<len;i++) {
	if ( i < 1 ) {
		swatchNames += cleanNames( swatches[i].name )
	} else {	
		swatchNames += "\n" + cleanNames( swatches[i].name )
	}
}

copyTextToClipboard(swatchNames);


function copyTextToClipboard( txt ) {
    const keyTextData         = app.charIDToTypeID('TxtD');
    const ktextToClipboardStr = app.stringIDToTypeID( "textToClipboard" );

    var textStrDesc = new ActionDescriptor();

    textStrDesc.putString( keyTextData, txt );
    executeAction( ktextToClipboardStr, textStrDesc, DialogModes.NO );
}

function cleanNames( str ) {
//++++++++++++++++++++++++++++++++++++++++++++++++
// Intended to clean up the names of SpotColors
//++++++++++++++++++++++++++++++++++++++++++++++++
	str = str.replace ( /^PANTONE /i , '' ) 
	str = str.replace ( /^Spot /i, '' ) 
	str = str.replace ( / C$/i , '' ) 
	str = str.replace ( /dk/i , 'Dark' ) 
	str = str.replace ( /lt/i , 'Light' ) 
	str = str.replace ( /underbase/i , 'Base' ) 
	str = str.replace ( /\w\S*/g ,
						function(txt){
							return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
						} )
	return str 
}