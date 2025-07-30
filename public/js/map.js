	mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style : "mapbox://styles/mapbox/streets-v12", //Style URL
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 8 // starting zoom
    });
const marker = new mapboxgl.Marker({color : "Green"})
 .setLngLat(listing.geometry.coordinates)//Listing.geometry.coordinates
 .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h5>${listing.location}</h5><p>Exact Location will be provided after booking</p>`
    ))
 .addTo(map);


