const [lng, lat] = coordinates;
const noQuotes = title.toUpperCase();

maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center:[lng , lat], // starting position [lng, lat]
  zoom: 11, // starting zoom
});

const markerHeight = 50, markerRadius = 10, linearOffset = 25;
const popupOffsets = {
  'top': [0, 0],
  'top-left': [0, 0],
  'top-right': [0, 0],
  'bottom': [0, -markerHeight],
  'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'left': [markerRadius, (markerHeight - markerRadius) * -1],
  'right': [-markerRadius, (markerHeight - markerRadius) * -1]
};

const marker = new maptilersdk.Marker({
  color: "red",
  draggable: true
}).setLngLat([lng , lat])
  .setPopup(new maptilersdk.Popup({ offset: popupOffsets, className: 'my-class' })
    .setHTML(`<h3 style="text-decoration: underline;"> ${noQuotes}</h3><p>Exact Location will be provided after booking.</p>`)
    .setMaxWidth("300px"))
  .addTo(map);


const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({
  apiKey: mapToken
});

map.addControl(gc, 'top-left'); 