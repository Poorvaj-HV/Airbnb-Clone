mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // center: [77.2088, 28.6139], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    style: "mapbox://styles/mapbox/streets-v12", // style URL 
    center: coordinates,
    zoom: 9 // starting zoom
});

const marker = new mapboxgl.Marker({ color: 'red'})
    // .setLngLat([12.554729, 55.70651])   // Listing.geometry.coordinates
    .setLngLat(coordinates)     // Listing.geometry.coordinates -> passed from show.ejs
    .addTo(map);
