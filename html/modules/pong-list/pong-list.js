/*
The MIT License (MIT)

Copyright (c) 2014 Markus Harms, ma@mh-svr.de

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
 */
log( "PoNG-List", "load module");
var poList = [];

function pongListDivHTML( divId, resourceURL, params ) {
	log( "PoNG-List",  "divId="+divId+" resourceURL="+resourceURL );
	poList[ divId ] = 
		{ 
			pongListDef: null,
			divId: null, 
			pongListStartRow: 0, 
			pongListEndRow: 0,
			pongListData: null, 
			pongListFilter: "" 
		};
	poList[ divId ].divId = divId;
	
	if ( moduleConfig[ divId ] != null ) {
		renderPongListDivHTML( divId, resourceURL, params, moduleConfig[ divId ] );
	} else {

		$.getJSON( 
			resourceURL+"/pong-list", 
			function( tbl ) {
				renderPongListDivHTML( divId, resourceURL, params, tbl );
			}
		);	
	}	
}

function renderPongListDivHTML( divId, resourceURL, params, tbl ) {
	log( "PoNG-List", "create HTML" );
	
	var dataUrl = resourceURL;
	if ( tbl.dataURL != null ) {
		dataUrl = dataUrl+"/"+tbl.dataURL;
	}
	poList[ divId ].pongListDef = tbl;
	poList[ divId ].pongListDef.dataUrlFull = dataUrl

	// crunch form
	poList[ divId ].pongListEndRow = tbl.maxRows;
	var contentItems = [];
	
	if ( tbl.filter != null &&  tbl.filter.dataReqParamsSrc != null && tbl.filter.dataReqParams != null ) {
		if ( tbl.filter.dataReqParamsSrc == 'Form' ) {
			contentItems.push( '<div id="'+divId+'PongListFrmDiv" class="pongListFrm">' );
			contentItems.push( '<form id="'+divId+'PongListFrm">' );
			contentItems.push( '<fieldset><legend>'+ $.i18n( 'Filter' ) + '</legend>' );
			
			postLst = [];						
			for( var y = 0; y < tbl.filter.dataReqParams.length; y++ ) {
				prop = tbl.filter.dataReqParams[y];
				contentItems.push( '<div class="PongListFrmFld"><label for="'+divId+prop.id+'">'+ $.i18n( prop.label ) +'</label>' );
				var nameAndClass = 'name="'+prop.id+'" id="'+divId+prop.id+'" class="text ui-widget-content ui-corner-all"'; 
				postLst.push( prop.id+": $( '#"+divId+prop.id+"' ).val()" )
				contentItems.push( '<input type="text" '+nameAndClass+'/></div>' );
				// TODO add field types
				
			}
			var btTxt = "Search";
			if ( tbl.filter.dataReqParamsBt != null ) { btTxt = tbl.filter.dataReqParamsBt}
			contentItems.push( '<button id="'+divId+'PongListSrchBt">'+  $.i18n( btTxt ) +'</button>' );
			contentItems.push( '</fieldset>' );
			contentItems.push( "</form>" );
			contentItems.push( '</div>' );


			poList[ divId ].pongListFilter = postLst.join( "," );

			contentItems.push( "<script>" );
			contentItems.push( '$(function() { ' );
			contentItems.push( '    $( "#'+divId+'PongListSrchBt" ).button().click( ' );
			contentItems.push( '       function( event ) { ' );
 			contentItems.push( '           event.preventDefault(); ' );
			contentItems.push( '           udateModuleData( "'+divId+'", ' );
			contentItems.push( '             { dataFilter: { '+poList[ divId ].pongListFilter+' } } ); ' );
			contentItems.push( '           return false;  ' );
			contentItems.push( '       }' );
			contentItems.push( '     );  ' );
			contentItems.push( ' }); ' );
			contentItems.push( "</script>" );
			
		} if ( tbl.filter.dataReqParamsSrc == 'sessionInfo' ) {
			// TODO implement pongForm sessionInfo
		}
	}
	
	contentItems.push( '<div id="'+divId+'PongList" class="pongList" width="100%">' );
	// cread table head
	for ( var r = 0; r < tbl.maxRows; r ++ ) {
		contentItems.push( '<div class="pongListRow">' );
		for ( var c = 0; c < tbl.divs.length; c ++ ) {
				if ( tbl.divs[c].cellType != 'tooltip'  ) {
					contentItems.push( '<div class="pongListCell pongListCell'+tbl.divs[c].id+'" id="'+divId+'R'+r+'C'+c+'">...</div>'  );
				}
		}
		contentItems.push( "</div>" );
	}
	// paginator buttons
	contentItems.push( "</div>" );
	
	contentItems.push( '<div id="'+divId+'PongListPagin" class="pongListPagin">' );
	contentItems.push( '<button id="'+divId+'BtFirst"></button>' );
	contentItems.push( '<button id="'+divId+'BtPrevPg"></button>' );
	contentItems.push( '<button id="'+divId+'BtPrev"></button>' );
	contentItems.push( '<button id="'+divId+'BtNext"></button>' );
	contentItems.push( '<button id="'+divId+'BtNextPg"></button>' );
	contentItems.push( '<button id="'+divId+'BtLast"></button>' );
	contentItems.push( "</div>" );
	
	// paginator script
	contentItems.push( "<script>" );
	contentItems.push( "$(function() { ");
	contentItems.push( ' $( "#'+divId+'BtFirst").button( {icons:{primary:"ui-icon-arrowthickstop-1-w"}} )');
	contentItems.push( '  .click( function() { ' );
	contentItems.push( '     poList[ "'+divId+'" ].StartRow =0; ' );
	contentItems.push( '     poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+';' );
	contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
	contentItems.push( ' $( "#'+divId+'BtLast" ).button( {icons:{primary:"ui-icon-arrowthickstop-1-e"}} )' );
	contentItems.push( '  .click( function() { ' );
	contentItems.push( '     poList[ "'+divId+'" ].pongListStartRow =  parseInt(poList[ "'+divId+'" ].pongListData.length)-parseInt('+tbl.maxRows+') ;' );
	contentItems.push( '     poList[ "'+divId+'" ].pongListEndRow = poList[ "'+divId+'" ].pongListData.length;' );
	contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
	
	contentItems.push( ' $( "#'+divId+'BtPrevPg" ).button( {icons:{primary:"ui-icon-arrowthick-1-w"}} )' );
	contentItems.push( '  .click( function() { ' );
	contentItems.push( '     if ( poList[ "'+divId+'" ].pongListStartRow - '+tbl.maxRows+' >= 0 ) { ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow -= '+tbl.maxRows+'; ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow -= '+tbl.maxRows+';  ' );
	contentItems.push( '     } else { ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow =0; ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+'; ' );
	contentItems.push( '     } ' );
	contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
	
	contentItems.push( ' $( "#'+divId+'BtNextPg" ).button( {icons:{primary:"ui-icon-arrowthick-1-e"}} ).click( ' );
	contentItems.push( '  function() {' );
	contentItems.push( '     var xx = parseInt(poList[ "'+divId+'" ].pongListStartRow) + parseInt('+tbl.maxRows +');' );
	contentItems.push( '     if ( xx < poList[ "'+divId+'" ].pongListData.length ) {' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow = parseInt(poList[ "'+divId+'" ].pongListStartRow) + parseInt('+tbl.maxRows+'); ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = parseInt(poList[ "'+divId+'" ].pongListEndRow) + parseInt('+tbl.maxRows+'); ' );
	contentItems.push( '        listDivCnt( "'+divId+'" );' );
	contentItems.push( '      }  } ); ' );
	
	contentItems.push( ' $( "#'+divId+'BtPrev" ).button( {icons:{primary:"ui-icon-carat-1-w"}} )' );
	contentItems.push( '  .click( function() { ' );
	contentItems.push( '     if ( poList[ "'+divId+'" ].pongListStartRow - 1 >= 0 ) { ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow-- ; ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow--;  ' );
	contentItems.push( '     } else { ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow =0; ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+'; ' );
	contentItems.push( '     } ' );
	contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
	
	contentItems.push( ' $( "#'+divId+'BtNext" ).button( {icons:{primary:"ui-icon-carat-1-e"}} ).click( ' );
	contentItems.push( '  function() {' );
	contentItems.push( '     var xx = parseInt(poList[ "'+divId+'" ].pongListStartRow) + 1;' );
	contentItems.push( '     if ( xx < poList[ "'+divId+'" ].pongListData.length ) {' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow = parseInt(poList[ "'+divId+'" ].pongListStartRow) + 1; ' );
	contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = parseInt(poList[ "'+divId+'" ].pongListEndRow) + 1; ' );
	contentItems.push( '        listDivCnt( "'+divId+'" );' );
	contentItems.push( '      }  } ); ' );


	contentItems.push( '  $( "#'+divId+'PongList" ).on( "mouseover", ".editableCell", ' );
	contentItems.push( '         function() { $(this).parent().toggleClass( "optedithighlight", true ); return $this; }' );
	contentItems.push( '  ).on( "mouseout", ".editableCell", ' );
	contentItems.push( '         function() { $(this).parent().toggleClass( "optedithighlight", false ); return $this; }' );
	contentItems.push( '  );' );
	contentItems.push( '  $( "#'+divId+'PongList" ).on( "focus", ".editableCell", ' );
	contentItems.push( '     function() { var $this = $(this); $this.data("before", $this.html()); ' );
	contentItems.push( '        $this.parent().toggleClass( "edithighlight", true ); return $this;' );
	contentItems.push( '  }).on( "focusout", ".editableCell", function() { ' );
	contentItems.push( '     var $this = $(this); ' );
	contentItems.push( '     $this.parent().toggleClass( "edithighlight", false );' );
	contentItems.push( '     if ($this.data("before") !== $this.html()) {' );
	contentItems.push( '        $this.data("before", $this.html()); ' ); 
	contentItems.push( '        var rowIdVal =  poList["'+divId+'"].pongListData[ $this.data("r") ]["'+tbl.rowId+'"]; ' );
	contentItems.push( '        var colId =  poList["'+divId+'"].pongListDef.divs[ $this.data("c") ].id; ' );
	contentItems.push( '        var colVal =  $this.html(); ' );
	//contentItems.push( '        alert( "Post Data Error: { '+tbl.rowId+': "+rowIdVal+", "+colId+": "+colVal+" }   (r="+$this.data("r") + "/c="+$this.data("c")+") not stored!!"  ); ' );
	contentItems.push( '        $.post( "'+dataUrl+'", { '+tbl.rowId+': rowIdVal, colId: colVal  }, function(response) {  }, "json");'); // TODO error handling
	contentItems.push( '     }' );
	contentItems.push( '     return $this;' );
	contentItems.push( '  }); ');
	contentItems.push( " }); </script>" );

	// create HTML
	$( "#"+divId ).html( contentItems.join( "\n" ) );
	
	if ( params != null  && params.filter != null ) {
		for ( var i = 0; i < params.filter.length; i++ ) {
			if ( i == 0 ) { 
				dataUrl += "?"+params.filter[i].field+'='+params.filter[i].value; 
			} else {
				dataUrl += "&"+params.filter[i].field+'='+params.filter[i].value; 						
			}
		}
	}

	// replace content of cells by data
	//console.log( 'dataUrl='+dataUrl );
	/*
	$.getJSON( dataUrl,  
		function( data ) { 	
			if ( tbl.dataDocSubPath == null ) {
				// table is the root of the doc
				//console.log( 'no tbl.dataDocSubPath' );
				poList[ divId ].pongListData = data; 					
			} else {
				console.log( 'tbl.dataDocSubPath='+tbl.dataDocSubPath );
				// table is somewhere in the DOM tree
				var pathToken = tbl.dataDocSubPath.split('.');
				console.log( 'pathToken[0] ' + pathToken[0] );
				var subdata = data[ pathToken[0] ];
				for ( i = 1; i < pathToken.length; i++ ) {
					console.log( 'pathToken['+i+'] ' + pathToken[i] );	
					subdata = subdata[ pathToken[i] ];
				}
				// console.log( ' subdata = ' + JSON.stringify( subdata ) );
				poTbl[ divId ].pongListData = subdata;
			}
			listDivCnt( divId ); 
		} 
	);
	*/
	pongListUpdateData( divId, null );
		
}

/** update data call back hook */
function pongListUpdateData( divId, paramsObj ) {
	log( "PoNG-List",  'update '+divId );
	var def = poList[ divId ].pongListDef;
	
	$.getJSON( def.dataUrlFull, paramsObj ,
		function( data ) { 	
			if ( def.dataDocSubPath == null ) {
				// table is the root of the doc
				log( "PoNG-List",  'no tbl.dataDocSubPath' );
				poList[ divId ].pongListData = data; 					
			} else {
				log( "PoNG-List",  'tbl.dataDocSubPath='+def.dataDocSubPath );
				// table is somewhere in the DOM tree
				var pathToken = def.dataDocSubPath.split('.');
				log( "PoNG-List",  'pathToken[0] ' + pathToken[0] );
				var subdata = data[ pathToken[0] ];
				for ( i = 1; i < pathToken.length; i++ ) {
					log( "PoNG-List", 'pathToken['+i+'] ' + pathToken[i] );	
					subdata = subdata[ pathToken[i] ];
				}
				// console.log( ' subdata = ' + JSON.stringify( subdata ) );
				poList[ divId ].pongListData = subdata;
			}
			listDivCnt( divId ); 
		} 
	);	
}

function listDivCnt( divId ) {
	var rowSt = parseInt( poList[ divId ].pongListStartRow );
	var rowEn = parseInt( poList[ divId ].pongListEndRow );
	log( "PoNG-List", "divId="+divId+"Data #"+poList[ divId ].pongListData.length + " rowSt="+rowSt + " rowEn="+rowEn );
	var i = 0;
	for ( var r = rowSt; r < rowEn; r++ ) {
		if ( r < poList[ divId ].pongListData.length ) {
			var cellDta = poList[ divId ].pongListData[r];
			for ( var c = 0; c < poList[ divId ].pongListDef.divs.length; c++ ) {
				var cellDef = poList[ divId ].pongListDef.divs[c];
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				var cellType = cellDef.cellType;
				
				log( "PoNG-List", "R="+i+" C="+c+" "+cellType+ "  "+cellDta[ cellDef.id ] );
				if ( cellType == 'text' ) {
					var editable = '';	
					if ( ( cellDef.editable != null ) && ( cellDef.editable == "true" ) ) { 
						editable = 'contenteditable="true" class="editableCell" data-r="'+r+'" data-c="'+c+'"'; 
						$( cellId ).html( '<div style="position:relative" class="editable"><span id="'+divId+'R'+i+cellDef.id+'" '+editable+'>'+cellDta[ cellDef.id ] + '</span><div class="ui-icon ui-icon-pencil editmarker"></div></div>' );
					} else {
						$( cellId ).html( '<span id="'+divId+'R'+i+cellDef.id+'">'+cellDta[ cellDef.id ] + '</span>' );
					}
				} else if ( cellType == 'linkLink' ) {
					
					var target = '';
					if ( cellDef.target != null ) {
						target = 'target="'+cellDef.target+'"';
					}
					var url = cellVal;
					if ( cellDef.URL != null ) {
						url = cellDef.URL;
					}
					if ( poTbl[ divId ].pongTableDef.rowId != null ) {
						if ( url.indexOf("?") > -1 ) {
							url += '&';
						} else {
							url += '?';
						}
						url += poTbl[ divId ].pongTableDef.rowId + '=' + cellDta[ poTbl[ divId ].pongTableDef.rowId ];
					} else {
						alert( "rowId == null" );
					}
					$( cellId ).html( '<a href="'+url+'" id="'+divId+'R'+i+cellDef.id+'" '+target+'>'+$.i18n( cellDef.label )+'</a>' );
					
				} else if ( cellType == 'img' ) {
					$( cellId ).html( '<img src="'+cellDta[ cellDef.id ]+'" id="'+divId+'R'+i+cellDef.id+'"/>' );
				} else if ( cellType == 'button'  ) {

					var contentItems = [];
					var ajaxType = 'POST';
					var param = '';
					if ( ( cellDef.method != null ) && ( cellDef.method.length != null ) ) {
						if ( cellDef.method == 'DEL-POST' ) {
							param = ',"actn":"DEL"';
						} else {
							ajaxType = cellDef.method; 
						}
					} 
					
					var url = poTbl[ divId ].resourceURL;
					if ( cellDef.URL != null ) {
						url = cellDef.URL;
					}
					
					// rowId can be a String or an Array					
					var rid = poTbl[ divId ].pongTableDef.rowId;
					if ( typeof rid === 'string' ) {
						param = '"'+rid+'":"'+ cellDta[ rid ] +'"';
						if ( ( ajaxType == 'GET' ) || ( ajaxType == 'DELETE' ) ) {
							url += '/?'+rid+'='+cellDta[ rid ];													
						}
					} else if ( Array.isArray( rid ) ) {
						var first = true;
						for ( var x = 0; x < rid.length; x++ ) {
							if ( ! first ) { param += ', '; } 
							param += '"'+rid[x]+'":"'+cellDta[ rid[x] ]+'"';
							if ( ( ajaxType == 'GET' ) || ( ajaxType == 'DELETE' ) ) {
								if ( first ) { url += '/?'; } else { url += '&'; } 
								url += rid[x]+'='+cellDta[ rid[x] ];								
							}
							first = false;
							//alert( "rid: "+i+"="+rid[i] );
						}
						//alert( url + " " + param);
					}
				
					if ( ( cellDef.url != null ) && ( cellDef.url.length != null ) ) {
						url = cellDef.url;
					}
					contentItems.push( '<button id="'+divId+'R'+i+cellDef.id+'">'+cellDef.label+'</button>' );
					contentItems.push( '<script>' );
					contentItems.push( '  $( function() { ' );
					contentItems.push( '       $( "#' +divId+'R'+i+cellDef.id+ '" ).click(' );
					contentItems.push( '          function() {  '); //alert( "'+ajaxType+' data: { rowId : '+ poTbl[ divId ].pongTableDef.rowId+'='+cellDta[ poTbl[ divId ].pongTableDef.rowId ] +' }"); ' );
					contentItems.push( '              $.ajax( ' );
					contentItems.push( '                 { url: "'+url+'", ');
					contentItems.push( '                   type: "'+ajaxType+'", ' );
					if ( ajaxType == 'POST' ) {
						contentItems.push( '                   data: { '+param+' } ' );						
					}
					contentItems.push( '              } ).done(  ' );
					contentItems.push( '                 function( dta ) { '); // alert( dta ); ' );
					if ( cellDef.target != null ) {
						if ( cellDef.target == '_parent' ) {
							contentItems.push( '                       window.location.replace( dta );');
						} else if ( cellDef.target == 'modal' ) {
							contentItems.push( '                       alert( dta );  ' );
						} else {
							contentItems.push( '                       $( "#'+cellDef.target+'Content" ).html( dta );  ' );									
						}
					}
					if ( ( cellDef.update != null ) && ( cellDef.update.length != null ) ) {
						for ( var upCnt = 0; upCnt < cellDef.update.length; upCnt++ ) {
							if ( cellDef.method == 'DELETE' ) {
								contentItems.push( '                 udateModuleData( "'+cellDef.update[upCnt].resId+'Content", { }  ); ' ); // otherwise deleted ID is requested and result is empty 					
							} else {
								contentItems.push( '                 udateModuleData( "'+cellDef.update[upCnt].resId+'Content", { '+param+' }  ); ' ); 													
							}
						}
					}
					contentItems.push( '                       return false;' ); 
					contentItems.push( '                  }  ' );
					contentItems.push( '              ); ');
					contentItems.push( '              return false;' ); 
					contentItems.push( '          }' );
					contentItems.push( '       ); ' );

					contentItems.push( '  } ); ' ); 
					contentItems.push( '</script>' );
					$( cellId ).html( contentItems.join( "\n" ) );
					
			} else if ( cellType == 'tooltip'  ) {
					$( '#'+divId+'R'+i+cellDef.label ).attr( 'title' , cellDta[ cellDef.id ] );
				} else {
					// ???
				}	
			}
		} else { // clear the rest of the cells
			for ( var c = 0; c < poList[ divId ].pongListDef.divs.length; c++ ) {
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				$( cellId ).html( '&nbsp;' );
			}
		}
		i++;
	}	
}