function reignYears(e) {
    let rStart = Number.parseInt(e['reign.start']);
    let rEnd = Number.parseInt(e['reign.end']);
    let reign = `${rStart >= 0 ? 'AD' : ''} ${Math.abs(rStart)} ${rStart < 0 ? 'BC' : ''} - ${rStart < 0 ? 'AD' : ''} ${Math.abs(rEnd)}`;
    return reign;
}

function isMobile() {
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
        return true;
    }
    return false;
}

function setUpLegends() {
    const linear = d3.scaleLinear()
        .domain([0, 21])
        .range(['#fff2f2', '#c70039']);

    let svg = d3.select('#province-legend');

    svg.append('g')
        .attr('class', 'legendLinear')
        .attr('transform', 'translate(20,20)');

    const legendLinear = d3.legendColor()
        .shapeWidth(30)
        .cells(4)
        .labels(['fewer', '', '', 'more'])
        .orient('horizontal')
        .scale(linear)
        .shapePadding(0);

    svg.select('.legendLinear')
        .call(legendLinear);

    const linearSize = d3.scaleLinear().domain([1, 9]).range([5, 15]);

    svg = d3.select('#town-legend');

    svg.append('g')
        .attr('class', 'legendSize')
        .attr('transform', 'translate(20, 20)');

    const legendSize = d3.legendSize()
        .scale(linearSize)
        .shape('circle')
        .shapePadding(20)
        .cells(4)
        .labels(['fewer', '', '', 'more'])
        .orient('horizontal');

    svg.select('.legendSize')
        .call(legendSize);
}

const cityInstruction = 'Hover over towns to see the details.';
const provinceInstruction = 'Hover over provinces to see the details.';

const mobile = isMobile();
var cityView = true;
var lastHoveredCityId = null;
var lastHoveredProvinceId = null;
const cityProvinceSwitch = document.getElementById('city-province-select');
const mapDiv = document.getElementById('map');
const detailDiv = document.getElementById('detail');
const detailContentDiv = document.getElementById('detail-content');
const detailPCOrMobile = mobile ? 'detail-mobile' : 'detail-pc';
const legendsPCOrMobile = mobile ? 'legends-mobile' : 'legends-pc';
const legendsDiv = document.getElementById('legends');
const legendsCardContainerDiv = document.getElementById('legends-card-container');

setUpLegends();

cityProvinceSwitch.addEventListener('input', (e) => {
    cityView = !cityProvinceSwitch.checked;
    lastHoveredCityId = null;
    lstHoveredProvinceId = null;
    let instruction = (!cityView) ? provinceInstruction : cityInstruction;
    let details = `<span class="card-title"><b>Roman Emperor Birthplaces</b></span><p>${instruction}</p>`;
    let provinceVisibility = (!cityView) ? 'visible' : 'none';
    map.setLayoutProperty('provinces-final-2ef0od', 'visibility', provinceVisibility);
    detailContentDiv.innerHTML = details;
});

detailDiv.classList.add(detailPCOrMobile);
legendsDiv.classList.add(legendsPCOrMobile);
if (mobile) legendsCardContainerDiv.classList.add('center-legends');

mapboxgl.accessToken = 'pk.eyJ1IjoiaHV5aWZlaTIzIiwiYSI6ImNrZGZlam56YTR4bmUycXF5ZHBwNXN2d2oifQ.9CcyvbFsEHyg6_t2YiJvzw';
const zoomLevel = mobile ? 2.25 : 3.98;
const center = mobile ? [15.046085, 50.903014] : [21.046085, 40.903014];

const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/huyifei23/ckdfeuatk0eim1imll5uve162/draft', // stylesheet location
    center: center,// starting position [lng, lat]
    zoom: zoomLevel // starting zoom
});

map.on('mousemove', 'city-7higia', e => {
    if (cityView && lastHoveredCityId != e.features[0].id) {
        let prop = e.features[0].properties;
        let emps = JSON.parse(prop['emperors']);
        let emperorList = emps.map(e => `${e['name']} ${reignYears(e)}`).join('<br>');
        let details = `
        <span class="card-title">
            <b>${prop['city.old']}, ${prop['prov.old']} (now ${prop['city.now']}, ${prop['state.now']})</b>
        </span>
        <p>Birthplace of ${prop['emperor.cnt']} emperor${(prop['emperor.cnt']) > 1 ? 's' : ''}<div class="divider"></div>${emperorList}</p>
        `;
        detailContentDiv.innerHTML = details;
        lastHoveredCityId = e.features[0].id;
    }
});

map.on('mousemove', 'provinces-final-2ef0od', e => {
    if (!cityView && lastHoveredProvinceId != e.features[0].id) {
        let prop = e.features[0].properties;
        let emps = JSON.parse(prop['emperors']);
        let emperorList = emps.map(e => `${e['name']} ${reignYears(e)}`).join('<br>');
        let details = `
        <span class="card-title">
            <b>${prop['name']}</b>
        </span>
        <p>Birthplace of ${prop['emperors.cnt']} emperor${(prop['emperors.cnt']) > 1 ? 's' : ''}<div class="divider"></div>${emperorList}</p>
        `;
        detailContentDiv.innerHTML = details;
        lastHoveredProvinceId = e.features[0].id;
    }
})