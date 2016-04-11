TRACKER.namespace('Player');

TRACKER.Player = (function() {
    'use strict';

    var player = {};

    player.onDateChangeCallback = null;
    player.changeCameraViewCallback = null;
    player.clicked = false;
    player.coordinateSystem = 'geocentric';
    player.date = null;
    player.play = true;
    player.speed = 1000;
    player.snapshotCallback = null;
    player.toggleCoordinatesCallback = null;
    player.width = null;

    player.init = init;
    player.dateClicked = dateClicked;
    player.forward = forward;
    player.hideCameraViewPopup = hideCameraViewPopup;
    player.hidePrehover = hidePrehover;
    player.onDateChange = onDateChange;
    player.onDateClicked = onDateClicked;
    player.onDateClickedAndMove = onDateClickedAndMove;
    player.rewind = rewind;
    player.showCameraViewPopup = showCameraViewPopup;
    player.showPrehover = showPrehover;
    player.toggleCoordinates = toggleCoordinates;
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
        player.toggleCoordinatesCallback = config.toggleCoordinatesCallback || null;
        player.changeCameraViewCallback = config.changeCameraViewCallback || null;
        player.snapshotCallback = config.snapshotCallback || null;

        player.updateScale(player.range, player.width);
        player.updateDateRange(player.date);
        player.updateHover();

        $('#play').click(player.togglePlay);
        $('#rewind').click(player.rewind);
        $('#forward').click(player.forward);
        $('#now').click(player.toNow);
        $('#speed').click(player.toggleSpeed);
        $('#coordinate_system').click(player.toggleCoordinates);
        $('#camera_view').click(player.showCameraViewPopup);
        $('#camera_view_popup .st-popup-item').click(player.changeCameraViewCallback);
        $('#snapshot').click(player.snapshotCallback);

        $('.st-progress-bar').mousedown(player.onDateClicked)
            .mousemove(player.onDateChange)
            .mouseenter(player.showPrehover)
            .mouseleave(player.hidePrehover);

        $(document).mousemove(player.onDateClickedAndMove)
            .mouseup(player.dateClicked)
            .mouseup(player.hideCameraViewPopup);

        return player;
    }

    function dateClicked(e) {
        player.clicked = false;
    }

    function forward() {
		player.date.setUTCMonth(player.date.getUTCMonth() + 1);
		player.updateDateRange(player.date);
        if (!player.play && typeof player.onDateChangeCallback === 'function') {
			player.onDateChangeCallback();
		}
    }

    function hideCameraViewPopup(e) {
        var container = $("#camera_view_popup");

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
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
		if (!player.play && typeof player.onDateChangeCallback === 'function') {
			player.onDateChangeCallback();
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
        if (!player.play && typeof player.onDateChangeCallback === 'function') {
			player.onDateChangeCallback();
		}
	}

    function showCameraViewPopup() {
		var popup = $('#camera_view_popup'),
			cameraView = $('#camera_view'),
			popupHalfWidth = popup.width() / 2;

		$('.st-popup-arrow').css({
			'left': $(document).width() - cameraView.offset().left + cameraView.outerWidth() / 2 - 5
		});
		popup.toggle(100);
	};

    function showPrehover() {
        $('.st-hover-progress').show(100);
        $('.st-selected-date').show(100);
    }

    function togglePlay() {
        player.play = !player.play;
        $('#pause_button').toggleClass('hide');
        $('#play_button').toggleClass('hide');
    }

    function toggleCoordinates() {
        $(this).toggleClass('warning');
        player.coordinateSystem = (player.coordinateSystem === 'heliocentric') ? 'geocentric' : 'heliocentric';
        if (typeof player.toggleCoordinatesCallback === 'function') {
            player.toggleCoordinatesCallback();
        }
    }

    function toggleSpeed() {
        $(this).toggleClass('red');
        player.speed = (player.speed === 1000) ? 3000 : 1000;
    }

    function toNow() {
        player.date = new Date();
        player.updateDateRange(player.date);
        if (!player.play && typeof player.onDateChangeCallback === 'function') {
            player.onDateChangeCallback();
        }
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
        player.width = width;
        player.scale = player.range / player.width;
    }

    return player;

})();
