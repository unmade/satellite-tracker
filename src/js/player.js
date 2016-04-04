TRACKER.namespace('Player');

TRACKER.Player = (function() {
    'use strict';

    var player = {};

    player.onDateChangeCallback = null;
    player.clicked = false;
    player.coordinateSystem = 'geocentric';
    player.date = null;
    player.onSystemCoordinateChangeCallback = null;
    player.play = true;
    player.speed = 1000;
    player.width = null;

    player.init = init;
    player.dateClicked = dateClicked;
    player.forward = forward;
    player.hidePrehover = hidePrehover;
    player.onDateChange = onDateChange;
    player.onDateClicked = onDateClicked;
    player.onDateClickedAndMove = onDateClickedAndMove;
    player.rewind = rewind;
    player.showPrehover = showPrehover;
    player.toggleCoordinateSystem = toggleCoordinateSystem;
    player.togglePlay = togglePlay;
    player.toggleSpeed = toggleSpeed;
    player.toNow = toNow;
    player.updateDateRange = updateDateRange;
    player.updateHover = updateHover;
    player.updateScale = updateScale;


    function init(conf) {
        var config = conf || {};

        player.date = config.date || new Date();
        player.width = $(document).width();
        player.onDateChangeCallback = config.onDateChangeCallback || null;
        player.onSystemCoordinateChangeCallback = config.onSystemCoordinateChangeCallback || null;

        player.updateScale(player.range, player.width);
        player.updateDateRange(player.date);
        player.updateHover();

        $('#play').click(player.togglePlay);
        $('#rewind').click(player.rewind);
        $('#forward').click(player.forward);
        $('#now').click(player.toNow);
        $('#speed').click(player.toggleSpeed);
        $('#coordinate_system').click(player.toggleCoordinateSystem);

        $('.st-progress-bar').mousedown(player.onDateClicked)
            .mousemove(player.onDateChange)
            .mouseenter(player.showPrehover)
            .mouseleave(player.hidePrehover);

        $(document).mousemove(player.onDateClickedAndMove)
            .mouseup(player.dateClicked);

        return player;
    }

    function dateClicked(e) {
        player.clicked = false;
    }

    function forward() {
		player.date.setUTCMonth(player.date.getUTCMonth() + 1);
		player.updateDateRange(player.date);
        if (!player.play && typeof player.callback === 'function') {
			player.callback();
		}
    }

    function hidePrehover() {
        if (player.clicked) return;
        $('.st-hover-progress').hide(100);
        $('.st-selected-date').hide(100);
    }

    function onDateChange(e) {
		var date = new Date(player.startDate + player.scale * e.pageX);
		$('.st-selected-date').css({
			'left': (player.width/2 >= e.pageX) ? e.pageX : 'auto',
			'right': (player.width/2 < e.pageX) ? player.width - e.pageX : 'auto'
		}).text(date);

		$('.st-hover-progress').css({
			width: e.pageX
		});

		if (!player.clicked) return;

		$('.st-play-progress').css({
			width: e.pageX
		});
		player.date = date;
		if (!player.play && typeof player.callback === 'function') {
			player.callback();
		}
	}

    function onDateClicked(e) {
        player.clicked = true;
        player.onDateChange(e);
    }

    function onDateClickedAndMove(e) {
        if (!player.clicked) return;
        player.onDateChange(e);
    }

    function rewind() {
		player.date.setUTCMonth(player.date.getUTCMonth() - 1);
		player.updateDateRange(player.date);
        if (!player.play && typeof player.callback === 'function') {
			player.callback();
		}
	}

    function showPrehover() {
        $('.st-hover-progress').show(100);
        $('.st-selected-date').show(100);
    }

    function togglePlay() {
        player.play = !player.play;
        $('#pause_button').toggleClass('hide');
        $('#play_button').toggleClass('hide');
    }

    function toggleCoordinateSystem() {
        $(this).toggleClass('warning');
        player.coordinateSystem = (player.coordinateSystem === 'heliocentric') ? 'geocentric' : 'heliocentric';
        if (typeof player.onSystemCoordinateChangeCallback === 'function') {
            player.onSystemCoordinateChangeCallback();
        }
    }

    function toggleSpeed() {
        $(this).toggleClass('red');
        player.speed = (player.speed === 1000) ? 3000 : 1000;
    }

    function toNow() {
        player.date = new Date();
        player.updateHover();
    }

	function updateDateRange(date) {
		player.startDate = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
		player.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
		player.range = player.endDate - player.startDate;
		player.updateScale(player.range, player.width);

		return player;
	}

	function updateHover() {
		$('.st-play-progress').css({
			width: (player.date.getTime() - player.startDate) / player.scale
		});
	}

    function updateScale(range, width) {
        player.scale = player.range / player.width;
    }


    return player;

})();
