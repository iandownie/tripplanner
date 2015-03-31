$(document).ready(function () {
    var data;
    var map;
    initialize_gmaps();

    days = [ []
    ];

$.ajax({
    type: "get",
    url: "./days/",
    success: function(data){
    // console.log(data.days)
       days=parseData(data.days);
        console.log("data:",data)
        insertDayItineraryItems(1)
        insertDayMarkers(1)
        days.forEach(function(el, index){
            // console.log("test", index)
            $('.add-day-btn').before($(createDayButton(index+1)))
            if(index===0){
                // console.log($(this))
                $('.add-day-btn').prev().addClass("current-day")
            }
        })
    }
})

    var currentDay = 1;

    var $dayHeading = $('#day-title span');
    var $removeDayButton = $('#day-title button');

    $('.add-item').on('click', function () {

        var $button = $(this);
        var item = getItemTypeAndText($button);
        marker = addItemToMap(item);
        addItemToDay(item, marker);
        addItemToChosenList(item);
        if(item.type==="hotel"){
            $.ajax({
                type: "POST",
                url: "./days/"+ currentDay +"/hotel",
                data: {text:item.text},
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        }else if(item.type==="restaurant"){
            $.ajax({
                type: "POST",
                url: "./days/"+ currentDay +"/restaurants",
                data:  {text:item.text,
                        today: currentDay
                        },
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        } else{
            $.ajax({
                type: "POST",
                url: "./days/"+ currentDay +"/thingsToDo",
                data:  {text:item.text},
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        }

        setMapBounds();

    

    });

    $('.chosen-group').on('click', '.remove', function () {
        var $item = $(this).parent();
        var name = $item.find('.title').text();
        $item.remove();
        removeItemFromDay(name);

        if(item.type==="hotel"){
            $.ajax({
                type: "delete",
                url: "./days/"+ currentDay +"/hotel",
                data: {text:item.text},
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        }else if(item.type==="restaurant"){
            $.ajax({
                type: "delete",
                url: "./days/"+ currentDay +"/restaurants",
                data:  {text:item.text,
                        today: currentDay
                        },
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        } else{
            $.ajax({
                type: "delete",
                url: "./days/"+ currentDay +"/thingsToDo",
                data:  {text:item.text},
                success: function(jqXHR){
                    // console.log(jqXHR)
                }
            })
        }



        // $.ajax({
        //     url: "./days/hotel",
        //     data: 
        // })

        setMapBounds();


    });

    $('.add-day-btn').on('click', function () {

        var $addButton = $(this);
        var currentNumberOfDays = $addButton.siblings().length;
        var $newDayButton = $(createDayButton(currentNumberOfDays + 1));

        $addButton.before($newDayButton);
        // console.log(days)
        days.push([]);

        
        $.ajax({
             type: "POST", 
             url: "./days"
             // success: success,
             // dataType: dataType
        });
        setMapBounds();
        $newDayButton.trigger('click');
    });

    $('.day-buttons').on('click', '.select-day', function () {

        var previousDay = currentDay;
        var thisDay = $(this).text();
        if (previousDay === thisDay) return;
        // console.log(thisDay)
        currentDay = thisDay;
        $(this).addClass('current-day').siblings().removeClass('current-day');
        $dayHeading.text('Day ' + thisDay);

        removeDayMarkers(previousDay);
        $('.chosen-group').find('.list-group').empty();

        insertDayMarkers(thisDay);
        insertDayItineraryItems(thisDay);

        setMapBounds();


    });

    $removeDayButton.on('click', function () {

        removeDayMarkers(currentDay);
        // days.splice(currentDay - 1, 1);

        $('.select-day').eq(currentDay - 1).remove();

        $('.select-day').each(function (index) {
            $(this).text(index + 1);
        });

        $.ajax({
            type: "delete",
            url: "./days/"+currentDay,
            success: function(data){
            // console.log(data.days)
               days=parseData(data.days);

                $('#control-panel').find('.itinerary-item').remove();
                $('.select-day').remove();
                insertDayItineraryItems(1)
                insertDayMarkers(1)
                currentDay = 1;
                days.forEach(function(el, index){
                    // console.log("test", index)
                    $('.add-day-btn').before($(createDayButton(index+1)))
                    if(index===0){
                        // console.log($(this))
                        $('.add-day-btn').prev().addClass("current-day")
                    }
                })
            }
        })
        
        $('.select-day').eq(0).trigger('click');

       

        setMapBounds();


    });

    function parseData(days){
           var iterinary = []; 
           days.forEach(function(day, idx){
               var currentDay = [];
               //handle hotel
               // console.log(day)
                if (day.hotel!==null && typeof(day.hotel)!=='undefined'){
                    var myLatlng = new google.maps.LatLng(day.hotel.place[0].location[0],day.hotel.place[0].location[1]);
                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        icon: 'images/' + getIconByType("hotel"),
                        // map: map,
                        title:day.hotel.name
                    });
                    currentDay.push({item: {type: 'hotel', text: day.hotel.name},
                               id: day.hotel._id,
                               marker: marker
                               })
                }
                if(day.restaurants!==null && typeof(day.restaurants)!=='undefined'){
                   day.restaurants.forEach(function(rest, idx){
                        var myLatlng = new google.maps.LatLng(rest.place[0].location[0],rest.place[0].location[1]);
                        var marker = new google.maps.Marker({
                            position: myLatlng,
                            icon: 'images/' + getIconByType("restaurant"),
                            // map: map,
                            title:rest.name
                        });
                        currentDay.push({item: {type: 'restaurant', text: rest.name},
                                       id: rest._id,
                                       marker:  marker
                                       })
                   });
                }
                if(day.thingsToDo!==null && typeof(day.thingsToDo)!=='undefined'){
                   day.thingsToDo.forEach(function(thing, idx){
                    var myLatlng = new google.maps.LatLng(thing.place[0].location[0], thing.place[0].location[1]);
                        var marker = new google.maps.Marker({
                            position: myLatlng,
                            icon: 'images/' + getIconByType("activity"),
                            // map: map,
                            title:thing.name
                        });
                        currentDay.push({item: {type: 'activity', text: thing.name},
                                       id: thing._id,
                                       marker:  marker
                                       })
                   });
               }
               iterinary[idx] = currentDay;
           })
           return iterinary;
       }
        

    function setMapBounds() {

        var bounds = new google.maps.LatLngBounds();
        var myLatlng= new google.maps.LatLng(40.705189, -74.009209);
        var dayItems = days[currentDay - 1];
        if(dayItems!==null && typeof(dayItems)!=='undefined' && dayItems.length!==0){
            dayItems.forEach(function (item) {
                bounds.extend(item.marker.position);
            });
            map.fitBounds(bounds);
        }else{
            map.setCenter(myLatlng);
            bounds.extend(myLatlng);
        }
    }

    function removeDayMarkers(dayNumber) {

        var dayItems = days[dayNumber - 1];

        dayItems.forEach(function (item) {
            item.marker.setMap(null);
        });

    }

    function insertDayItineraryItems(dayNumber) {

        var dayItems= days[dayNumber -1];
        // var dayItems=[]
        // day.hotel;
        // day.restaurants=[];
        // day.thingsToDo=[];
        // dayItems.push({item: {type:"hotel", text: day.hotel.name},
        //     id: day.hotel._id,
        //     marker: [day.hotel.place]
        // })
        // console.log("dayItems: ", dayItems)
        dayItems.forEach(function (item) {
            addItemToChosenList(item.item);
        });

    }

    function insertDayMarkers(dayNumber) {

        var dayItems = days[dayNumber - 1];

        dayItems.forEach(function (item) {
            item.marker.setMap(map);
        });

    }

    function addItemToDay(item, marker) {
        var day = days[currentDay - 1];
        day.push({ item: item, marker: marker });
    }

    function removeItemFromDay(name) {

        var dayItems = days[currentDay - 1];

        var item = dayItems.filter(function (item) {
            return item.item.text === name;
        })[0];

        var index = dayItems.indexOf(item);

        dayItems.splice(index, 1);

        item.marker.setMap(null);

    }

    function addItemToMap(item) {

        var lngLat = getLngLat(item);
        var icon = getIconByType(item.type);
        var marker = drawLocation(lngLat, {icon: 'images/' + icon});

        return marker;

    }

    function getIconByType(type) {
        switch (type) {
            case 'hotel':
                return 'lodging_0star.png';
            case 'restaurant':
                return 'restaurant.png';
            case 'activity':
                return 'star-3.png';
        }
    }

    function getLngLat(item) {

        var typeToCollectionDict = {
            'hotel': all_hotels,
            'restaurant': all_restaurants,
            'activity': all_things_to_do
        };

        var collection = typeToCollectionDict[item.type];

        var itemInCollection = collection.filter(function (collectionItem) {
            return collectionItem.name === item.text;
        })[0];

        var locationData = itemInCollection.place[0].location;

        return locationData;

    }

    function getItemTypeAndText($button) {

        var $grouping = $button.parent();
        var itemGroup = $grouping.attr('id').split('-')[0];

        var $select = $button.siblings('select');
        var itemText = $select.val();

        return {
            type: itemGroup,
            text: itemText
        };

    }

    function matchListToType(type) {
        switch (type) {
            case 'hotel':
                return '#chosen-hotels';
            case 'restaurant':
                return '#chosen-restaurants';
            case 'activity':
                return '#chosen-activities';
        }
    }

    function addItemToChosenList(item) {

        var listContainerId = matchListToType(item.type);
        var $chosenListContainer = $(listContainerId);

        $chosenListContainer.find('ul').append(createItineraryItem(item));

    }

    function createItineraryItem(item) {

        var html = '<div class="itinerary-item">' +
            '<span class="title">' + item.text + '</span>' +
            '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
            '</div>';

        return $(html);

    }

    function initialize_gmaps() {
        var styleArr = [
            {
                'featureType': 'landscape',
                'stylers': [
                    {'saturation': -100},
                    {'lightness': 60}
                ]
            },
            {
                'featureType': 'road.local',
                'stylers': [
                    {'saturation': -100},
                    {'lightness': 40},
                    {'visibility': 'on'}
                ]
            },
            {
                'featureType': 'transit',
                'stylers': [
                    {'saturation': -100},
                    {'visibility': 'simplified'}
                ]
            },
            {
                'featureType': 'administrative.province',
                'stylers': [
                    {'visibility': 'off'}
                ]
            },
            {
                'featureType': 'water',
                'stylers': [
                    {'visibility': 'on'},
                    {'lightness': 30}
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.fill',
                'stylers': [
                    {'color': '#ef8c25'},
                    {'lightness': 40}
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.stroke',
                'stylers': [
                    {'visibility': 'off'}
                ]
            },
            {
                'featureType': 'poi.park',
                'elementType': 'geometry.fill',
                'stylers': [
                    {'color': '#b6c54c'},
                    {'lightness': 40},
                    {'saturation': -40}
                ]
            }
        ];
        // initialize new google maps LatLng object
        var myLatlng = new google.maps.LatLng(40.705189, -74.009209);
        // set the map options hash
        var mapOptions = {
            center: myLatlng,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: styleArr
        };
        // get the maps div's HTML obj
        var map_canvas_obj = document.getElementById("map-canvas");
        // initialize a new Google Map with the options
        map = new google.maps.Map(map_canvas_obj, mapOptions);
    }

    function drawLocation(location, opts) {
        if (typeof opts !== 'object') opts = {};
        opts.position = new google.maps.LatLng(location[0], location[1]);
        opts.map = map;
        var marker = new google.maps.Marker(opts);
        return marker;
    }

    function createDayButton(dayNumber) {
        var html = '<button class="btn btn-circle day-btn select-day">'
                      + dayNumber +
                   '</button>';
        return html;
    }
    // function rebound () {
    //     var myLatlng = new google.maps.LatLng(40.705189,-74.009209);
    //     var reBounds = new google.maps.LatLngBounds();

    //     if(markerArr.length) {
    //         markerArr.forEach(function(marker){
    //             if(marker) reBounds.extend(marker.position)
    //         map.fitBounds(reBounds)
    //         })
    //     } else {
    //         map.setCenter(myLatlng);
    //         reBounds.extend(myLatlng);    
    //         map.setZoom(13);
    //     }
    // }
});