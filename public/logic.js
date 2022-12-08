// Predefined settings and native functions

//login required- csak ha authenticated 

//non login required- csak ha nem bejelentkezett

_.iOS = !! navigator.platform.match( /iPhone|iPod|iPad/ );

_.handlerLocation = "handler.php";

_.user = {};
_.user.data = {};

try{ _.user.data = localStorage[ "babanevUser" ].json(); } catch( e ){}

$.fn.collectFormData = function(){

	var collection = {};

	var elementSet = $( this );

	for( var i = 0; i < elementSet.length; i++ ){

		var element = $( elementSet[ i ] );

		var index = element.attr( "name" );

		if( index ){

			collection[ index ] = element.val();

		}

	}

	return collection;

};

Number.prototype.huf = function (m , toFixedPrecision ) {

	return ("" + this.valueOf()).huf(m , toFixedPrecision);

};

Number.prototype.int = function () {

	return (+this.valueOf());

};

String.prototype.huf = function (m, toFixedPrecision) {

	if (typeof m === "undefined") m = true;

	var v = this.valueOf();

	var currencySuffix = " Ft";
	var currencyPrefix = "";

	if (m) {

		v = currencyPrefix + (+v).currency( " ", toFixedPrecision ) + currencySuffix;

	} else {

		v = v.replace(/[^\d.-]/g, '');

		v = parseFloat( v );

		v = v.int();

	}

	return v;

};

// Lazy Load

_.lazyLoad = {};

_.lazyLoad.tick = function (forceLazyLoadTick) {

	if (!document.hasFocus() && !forceLazyLoadTick) return false;

	var elementsToCheck = $( "[data-src]:visible" );

	for (var i = 0; i < elementsToCheck.length; i++) {

		var elementCurrentlyBeingChecked = $(elementsToCheck[i]);

		// if( elementCurrentlyBeingChecked.closest( ".window:not( .active )" ).length > 0 ) continue;

		if (
			elementCurrentlyBeingChecked.visible( ! _.body.hasClass( "ignore-packets" ) ) ||
			elementCurrentlyBeingChecked.is( ".hero" ) ||
			elementCurrentlyBeingChecked.closest( ".window:not( .active )" ).length > 0
		) {

			var elementsToLoad = $( "[data-src='" + elementCurrentlyBeingChecked.attr( "data-src" ) + "']");

			elementsToLoad.attr( "src", elementCurrentlyBeingChecked.attr( "data-src" ) );

			elementsToLoad.removeAttr( "data-src" );

		}

	}

};

_.lazyLoad.init = function(){

	_.lazyLoad.tick( true );

	setInterval( _.lazyLoad.tick, 1000 );

	var imageElementsOnPage = $( "img[data-src]" );

	var sourcesOnPage = [];

	for( var i = 0; i < imageElementsOnPage.length; i++ ){

		sourcesOnPage.push( $( imageElementsOnPage[ i ] ).attr( "data-src" ) );

	}

};

// Resize related functions

_.resize = {};
_.resize.do = [];
_.resize.raf = function(){

	if( typeof _.resize.io !== "undefined" ){

		clearTimeout( _.resize.io );

	}

	_.resize.io = render( function(){

		_.viewport.height = _.window.height();
		_.viewport.width = _.window.width();

		for( i in _.resize.do ){

			_.resize.do[i]();

		}

	});

	_.window.trigger( "scroll" );

	_.lazyLoad.tick( true );

};

// Forms

_.forms = {};
_.forms.$ = $( "form" );

_.forms.register = {};
_.forms.register.$ = _.forms.$.filter( "[data-method='register']" );
_.forms.register.validate = function(){

	var fieldsToCheck = [

		/*

		{
			element : _.forms.register.$.find( ".field.required [name='name']" ),
			validation : function( value ){

				return value.indexOf( " " ) > 0;

			}
		},

		*/

		{
			element : _.forms.register.$.find( ".field.required [name='email']" ),
			validation : function( value ){

				return value.lastIndexOf( "." ) > value.indexOf( "@" ) + 1 && value.indexOf( "@" ) > 0;

			}
		
		},

		{
			element : _.forms.register.$.find( ".field.required [name='password']" ),
			validation : function( value ){

				return value.length >= 6;

			}
		},

		{
			element : _.forms.register.$.find( ".field.required [name='repeat-password']" ),
			validation : function( value ){

				return value === _.forms.register.$.find( ".field.required [name='password']" ).val();

			}
		} 

	];

	var error = false;

	for( var i = 0; i < fieldsToCheck.length; i++ ){

		if( ! fieldsToCheck[ i ].validation( fieldsToCheck[ i ].element.val() ) ){

			error = true;

			fieldsToCheck[ i ].element.closest( ".field" ).class( "error" ).find( "input" ).one( "input change" , function(){

				$( this ).closest( ".field" ).class( "error" , false );				

			} );

		}

	}

	var tacCheckbox = _.forms.register.$.find( ".tac [type='checkbox']" );

	if( ! tacCheckbox.is( ":checked" ) ){

		tacCheckbox.closest( ".field" ).class( "error" ).find( "input" ).one( "click change" , function(){

			$( this ).closest( ".field" ).class( "error" , false );	

		} );

		error = true;

	}

	if( ! error ){

		_.forms.register.send();

	}

};

_.forms.register.send = function(){

	var formData = _.forms.register.$.find( "input" ).collectFormData();

	localStorage[ "emailGivenAtRegistration" ] = formData.email;

	try{ localStorage[ "emailGivenAtRegistration" ] = formData.email; } catch( e ){}

	_.forms.register.$.find( "button.cta" ).class( "loading" );

	_.handlerLocation.post({

		do : "Barion/Start",
		data : {

			email : formData.email

		}

	}).done( function( response ){

		var response = response.json();

		if( response.data.payment_url ){

			location.href = response.data.payment_url;			

		}

	} );

};

_.forms.login = {};
_.forms.login.$ = _.forms.$.filter( "[data-method='login']" );
_.forms.login.validate = function(){

	var fieldsToCheck = [

		{
			element : _.forms.login.$.find( ".field.required [name='email']" ),
			validation : function( value ){

				return value.length > 3;

			}
		},

		{
			element : _.forms.login.$.find( ".field.required [name='password']" ),
			validation : function( value ){

				return value.length >= 8;

			}
		}

		/*

		{
			element : _.forms.login.$.find( ".field.required [name='code']" ),
			validation : function( value ){

				return value.length > 0;

			}
		}

		*/

	];

	var error = false;

	for( var i = 0; i < fieldsToCheck.length; i++ ){

		if( ! fieldsToCheck[ i ].validation( fieldsToCheck[ i ].element.val() ) ){

			error = true;

			fieldsToCheck[ i ].element.closest( ".field" ).class( "error" ).find( "input" ).one( "input change" , function(){

				$( this ).closest( ".field" ).class( "error" , false );				

			} );

		}

	}

	if( ! error ){

		_.forms.login.send(  _.forms.login.$.find( ".field.required [name='code']" ).val() );

	}

};

_.forms.login.send = function( code , allowRedirects ){

	if( typeof allowRedirects === "undefined" ){

		allowRedirects = true;

	}

	_.user.update( code, true, allowRedirects );
	
};

_.forms.recovery = {};
_.forms.recovery.$ = _.forms.$.filter( "[data-method='recovery']" );
_.forms.recovery.validate = function(){

	var fieldsToCheck = [

		{
			element : _.forms.recovery.$.find( ".field.required [name='email']" ),
			validation : function( value ){

				return value.length > 0;

			}
		}

	];

	var error = false;

	for( var i = 0; i < fieldsToCheck.length; i++ ){

		if( ! fieldsToCheck[ i ].validation( fieldsToCheck[ i ].element.val() ) ){

			error = true;

			fieldsToCheck[ i ].element.closest( ".field" ).class( "error" ).find( "input" ).one( "input change" , function(){

				$( this ).closest( ".field" ).class( "error" , false );				

			} );

		}

	}

	if( ! error ){

		_.forms.recovery.send();

	}

};

_.forms.recovery.send = function(){

	// XHR

	var response = {

		status : true

	};

	// -----------------

	if( ! response.status ){

		return _.forms.login.$.find( ".field.required [name='password']" ).closest( ".field" ).class( "error" ).find( "input" ).one( "focus change" , function(){

			$( this ).closest( ".field" ).class( "error" , false );				

		} );

	}

	_.forms.recovery.$.class( "done" );

};

// Audio

_.audio = {};

_.audio.cache = function(){

	$( ".audio-mute-switch" ).class( _.audio.mute );

	for( var i = 0; i < _.audio.cache.precached_sounds.length; i++ ){

		var source = _.audio.cache.precached_sounds[ i ];

		_.audio.cache[ source ] = new Audio( source );

		_.audio.cache[ source ].preload = "auto";

		try{

			_.audio.cache[ source ].load();

		} catch( e ){}

	}

};

_.audio.cache.precached_sounds = [

	"media/pop.mp3"

];

_.audio.play = function( source, volume ){

	if(typeof volume === "undefined"){

		volume = 1;

	}

	if( _.iOS || _.audio.mute ){

		return false;

	}

	var audio = _.audio.cache[ source ];

	if( ! audio ){

		return false;

	}

	audio.currentTime = 0;

	audio.volume = volume;

	try{

		audio.play();

	} catch( e ){}

};

_.audio.stop = function( source ){

	if( _.iOS ){

		return false;

	}

	var audio = _.audio.cache[ source ];

	if( typeof audio === "undefined" ){

		return false;

	}

	audio.pause();
	audio.currentTime = 0;

};

_.audio.mute = false;

try{

	if( typeof localStorage[ "audio-mute-state" ] !== "undefined" ){

		_.audio.mute = localStorage[ "audio-mute-state" ].json();

	}

} catch( e ){}

// Spinner

_.spinner = {};
_.spinner.spinStateElements = $( ".spinner [data-spinner-state]" );

_.spinner.switch = function(){

	// clearTimeout( _.spinner.switch.timeout );

	// _.spinner.switch.timeout = setTimeout( function(){

		var currentStateElement = _.spinner.spinStateElements.not( ".inactive" );

		var nextStateElement = currentStateElement.loopNext();

		_.spinner.spinStateElements.class( "inactive" );

		setTimeout( function(){

			nextStateElement.class( "inactive" , false );

			var newState = nextStateElement.attr( "data-spinner-state" );

			nextStateElement.closest( ".spinner" ).attr( "data-spinner-state-projection" , newState );

			if( newState === "loading" ){



			}

		} , 400 );

	// } , 300 );

};

// Events

_.document.on( "ready", function(){

	_.body.class( "loaded" );

	_.lazyLoad.init();
	_.audio.cache();

} ).on( "click" , "[href^='#']",  function( e ){

	var o = $( this );

	var target = $( o.attr( "href" ) );

	if( target.length === 0 ){

		target = $( "[data-scrollstop='" + o.attr( "href" ) + "']" );

	}

	if( target.length > 0 ){

		e.preventDefault();

		target.class( "scroll-destination" );

		setTimeout( function(){

			target.class( "scroll-destination" , false );

		} , 300 );

		_.html.scrollTop( target.offset().top - 100 );

	}

} ).on( "click" , "a, button" , function(){

	_.audio.play( "media/pop.mp3" );

	try{ navigator.vibrate(30); } catch( e ){}

} ).on( "click" , "button" , function(){

	var button = $( this ).class( "animate" , false );

	clearTimeout( button.attr( "data-current-animation-timeout" ) );

	var buttonTimeout = setTimeout( function(){

		button.class( "animate" , false );

	} , 750 );

	setTimeout( function(){

		button.attr( "data-current-animation-timeout" , buttonTimeout ).class( "animate" );

	} , 5 );

} ).on( "mousedown touchstart" , ".window, .window *" , function( event ){

	event.stopPropagation();

	var target = $( this );

	if( target.is( ".window" ) && ! target.is( ".persistent" ) ){

		target.class( "active" , false ).find( ":focus" ).blur();

		location.hash = "#_";

	}

} ).on( "keydown" , "form", function( event ){

	if( event.keyCode == 13 ){

		$( this ).closest( "form" ).find( ".cta" ).first().trigger( "click" );

	}

} ).on( "submit" , "form" , function( event ){

	event.preventDefault();

	$( "input" ).blur();

	var formElement = $( this );

	var factory = _.forms[ formElement.attr( "data-method" ) ];

	if( factory && factory.validate ){

		factory.validate();

	}

} ).on( "click" , ".spinner [data-spinner-state] button.main" , function(){

	_.spinner.switch();

} ).on( "click" , ".logout" , function(){

	try{

		delete localStorage[ "user" ];

	} catch( e ){}

	_.user.data = {};

	_.user.draw();

	// TODO ilyen gomb kellene a hogyan működik mellé vagy helyett, talán inkább mellé

} ).on( "click" , ".cookie-banner .close" , function(){

	try{ localStorage[ "cookieBannerClosed" ] = + new Date(); } catch( e ){}

	$( ".cookie-banner" ).class( "hidden" );

} )

_.window.on( "load hashchange" , function( e ){

	if( location.hash === "#_" ){

		e.preventDefault();

	}

	if( location.hash === "#regisztracio" ){

		_.forms.login.$.class( "hidden" );
		_.forms.register.$.class( "hidden" , false );

		setTimeout( function(){

			_.forms.register.$.find( "input:visible:first" ).focus();

		} , 1000 );
	}

	if( location.hash === "#bejelentkezes" ){

		_.forms.register.$.class( "hidden" );
		_.forms.login.$.class( "hidden" , false );

		setTimeout( function(){

			_.forms.login.$.find( "input:visible:first" ).focus();

		} , 1000 );
	}

	if( location.hash === "#kapcsolat" ){

		setTimeout( function(){ 

			$( ".window.contact" ).class();

		} , 100 );

	}

	if ( location.hash === "#menu" ) {
		
		setTimeout( function () {

			$(".window.menu").class();

		} , 100);
	}

	if( location.hash === "#partnereink" ){

		setTimeout( function(){ 

			$( ".window.partners" ).class();

		} , 100 );

	}

	if( location.hash === "#regisztracio" || location.hash === "#bejelentkezes" ){

		if( _.user.data && _.user.data.code ){

			return location.href = "/app";

		}

		$( ".window.login" ).class();

	}

} ).on( "resize" , _.resize.raf );





$( "[class*='request-specific-page-'" ).not( "[class*='home']" ).remove();

// _.body.class( "logged-in" );


/*

	Memo:

	- Felfüggesztett quiz-t hogyan lehet folytatni? Legjobb lenne egy opció az új quiz kezdésénél, mondjuk egy egyszerű kétopciós felugró ablakban. Általánosságban a pending quizeket tudnia kell majd az oldalnak, nem elég akkor eltenni, amikor valaki a felfüggesztésre nyom. Így módon ha pl. bezárják a cuccot, akkor is lehet majd folytatni a megkezdett quizt.

*/