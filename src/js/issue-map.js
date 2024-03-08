
import $ from 'jquery';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet.fullscreen';
import 'leaflet.locatecontrol';
import './circle-marker-dynamic';
import './timedout-marker';

import dataManager from './dataManager';
import {request} from "./utils";

var issuesmap, issueslayer;

function fitMapBoundsFromIssues() {
	if (Object.keys(issueslayer.getBounds()).length) {
		issuesmap.fitBounds(issueslayer.getBounds())
	}
}

export async function init() {
	if (issuesmap !== undefined) {
		issuesmap.invalidateSize()
		return;
	}
	var issues = await dataManager.getData();
	$('#issues-map').empty();
	issuesmap = L.map('issues-map').setView([48.041475 , 7.122932], 13);
	window.issuesmap = issuesmap;

	var baseLayers = {
		"Carte": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		}).addTo(issuesmap),
		"Photos": L.tileLayer(
			"https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?" +
			"&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
			"&STYLE=normal" +
			"&TILEMATRIXSET=PM" +
			"&FORMAT=image/jpeg" +
			"&LAYER=ORTHOIMAGERY.ORTHOPHOTOS" +
			"&TILEMATRIX={z}" +
			"&TILEROW={y}" +
			"&TILECOL={x}",
			{
				minZoom: 0,
				maxZoom: 20,
				maxNativeZoom: 18,
				attribution: '<a href="http://www.ign.fr">IGN-F/Geoportail</a>',
				tileSize: 256
			}
		),
	};

	L.control.layers(baseLayers, {}).addTo(issuesmap);
	L.control.locate({locateOptions:  {flyTo: true, keepCurrentZoomLevel: true, enableHighAccuracy: true}}).addTo(issuesmap);
}
var firstFocus = true;
export async function focus() {
	issuesmap.invalidateSize();
	if (firstFocus) {
		firstFocus = false;
		fitMapBoundsFromIssues()
	}
}
export async function cleanIssues() {
	issueslayer.clearLayers()
	issuesmap.removeLayer(issueslayer)
}

export async function displayIssues(nozoom) {
	// Create layer and fill
	issueslayer = L.featureGroup([])
		.addTo(issuesmap)
		.on('click', (e) => { viewIssue(e.propagatedFrom.options.issue.token) });

	var issues = await dataManager.getData();

	for (var i in issues) {

		var marker = L.circleMarkerDynamic(
			[issues[i].lat_float, issues[i].lon_float],
			{
				styles: STYLES,
				issue: issues[i],
				color: issues[i].color
			}
		);
		issueslayer.addLayer(marker);
	}
	if (nozoom != true) {
		fitMapBoundsFromIssues()
	}

}

export async function getAdress(lat,lng){
	return request(`https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/reverse?lon=${lng}&lat=${lat}&index=address&limit=10&returntruegeometry=false`)
		.then(res => {
			if(!res.features || res.features.length === 0){
				return "Adresse inconnue"
			}
			const properties = res.features[0].properties
			const rue = properties.name
			const postcode = properties.citycode
			const city = properties.city
			return rue + ' ' + postcode + ' ' + city
		})
}


export async function createIssueOnClick(){

	issuesmap.on('click', async function (e) {
		console.log(e.latlng)
		await getAdress(e.latlng.lat, e.latlng.lng).then((adresse) => {
			L.popup()
				.setLatLng(e.latlng)
				.setContent(`<a title="Ajouter une obversation" class="btn-floating btn-small yellow darken-3 black-text" 
				onclick="startForm()">
				<i class="material-icons">add</i>
			  </a> ${adresse} `)
				.openOn(issuesmap)
			const url = new URL(window.location.href);
			url.searchParams.set('lat', e.latlng.lat);
			url.searchParams.set('lng', e.latlng.lng);
			url.searchParams.set('adresse', adresse);
			window.history.pushState({}, '', url);

		})

	});
}


export async function centerOnIssue(token) {
	focus();
	var issues = await dataManager.getData();
	var issue = issues.filter(item => item.token == token)[0];
	issuesmap.setView([issue.lat_float, issue.lon_float], 18)
	L.timedOutMarker([issue.lat_float, issue.lon_float]).addTo(issuesmap);
	M.Tabs.getInstance($("#issues .tabs")[0]).select('issues-map')
	M.Modal.getInstance($("#modal-issue")[0]).close();
}

window.centerOnIssue = centerOnIssue

const STYLES = {
	"0-11": {
		radius: 1,
		weight: 1,
	},
	"12-13": {
		radius: 2,
		weight: 1,
	},
	"14-15": {
		radius: 4,
		weight: 1,
	},
	"16-20": {
		radius: 8,
		weight: 2,
	}
}
