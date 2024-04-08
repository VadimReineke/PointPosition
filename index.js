let workArr = [];
let inputArr = [];
let inputCoordinateObj = {};
let query = {};
let apiKey = '';
let secretKey = '';

const getMap2GisApi = async () => {
    removeMap();
    clearAdres();

    createWorkArr();

    let map;

    DG.then(function () {
        map = DG.map('map', {
            center: [55.89, 49.20],
            zoom: 6
        });

        let myIcon = DG.icon({
            iconUrl: 'https://icon-icons.com/icons2/317/PNG/512/map-marker-icon_34392.png',
            iconRetinaUrl: 'https://icon-icons.com/icons2/317/PNG/512/map-marker-icon_34392.png',
            iconSize: [34, 42],
            // iconAnchor: [22, 94],
            // popupAnchor: [-3, -76],
             shadowUrl: 'https://icon-icons.com/icons2/317/PNG/512/map-marker-icon_34392.png',
             shadowRetinaUrl: 'https://icon-icons.com/icons2/317/PNG/512/map-marker-icon_34392.png',
            shadowSize: [68, 95],
            // shadowAnchor: [22, 94]
        });

        // разбираем массив и генерируем точку на карте если данные из текстареа
        if (workArr.length !== 0) {
            for (i = 0; i < workArr.length; i++) {
                let point = JSON.parse(workArr[i]);
                //DG.marker(point.item).addTo(map).bindPopup(point.id)
                 !point.lost ? DG.marker(point.item).addTo(map).bindPopup(point.id) : DG.marker(point.item, { icon: myIcon }).addTo(map).bindPopup(point.id)
                // if (point.lost === true) {
                //     console.log(point.id)
                // }
            }
        }

        // генерируем точку на карте если данные из формы

        if (inputCoordinateObj !== false) {
            console.log(inputCoordinateObj)
            workArr = []
            if (inputCoordinateObj.lost === "false") {
                DG.marker(inputCoordinateObj.item).addTo(map).bindPopup(inputCoordinateObj.id)
            } else (DG.marker(inputCoordinateObj.item, { icon: myIcon }).addTo(map).bindPopup(inputCoordinateObj.id))

            let marker = Array.from(document.getElementsByClassName('leaflet-marker-icon'))
            if (marker.length > 1) {
                for (i = 0; i < (marker.length - 1); i++) {
                    let element = marker[i];
                    element.remove();
                }
            }
        }
    });
}

const dadataApi = async (query) => {

    let adresContainer = document.getElementById('adres');

    // let query = adresArr[i]
  
    let url = "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    const response = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + apiKey
            },
            body: JSON.stringify(query)
        }
    );

    const reserveData = await response.json();
    let adressList = document.createElement('ul');
        adressList.classList.add('adres-list')
    let adressListDescr = document.createElement('p');
        adressListDescr.innerHTML ='Серийный номер ПУ:' + "" + query.idPoint;
        adressList.append(adressListDescr);
        adresContainer.append(adressList);

    if (reserveData.suggestions.length > 0) {
        for (j=0; j < reserveData.suggestions.length; j++) {
            let item = document.createElement('li');
            let itemDescr = document.createElement('p');
                 itemDescr.innerHTML = reserveData.suggestions[j].value;
              item.append(itemDescr);
              adressList.append(item);   
        }
}
}

const createWorkArr = () => {
    let value = document.getElementById('textarea').value
    if (value !== '') {
        workArr = value.split('\n') // получаем данные из текстареа
        return workArr
    }
}

const addMap = () => {
    let main = document.getElementById('main');
    let mapContainer = document.createElement('div');
    mapContainer.classList.add('main__map');
    mapContainer.setAttribute('id', 'map');
    mapContainer.classList.add('main__map');
    main.append(mapContainer);
}
const removeMap = () => {
    let map = document.getElementById('map');
    map.remove();
    addMap()
}

const inputCoordinate = () => {
    workArr = []
    removeMap();

    let latitude = document.getElementById('latitude').value;
    let longitude = document.getElementById('longitude').value;
    let pointName = document.getElementById('id').value;
    let needSearch = document.getElementById('selectNeedSearch').value;
    let radiusMeters = document.getElementById('radiusMeters').value;

    if(radiusMeters === '') {radiusMeters = 0}

    if (latitude != "") {
        inputCoordinateObj = {
            item: [latitude, longitude],
            id: pointName,
            lost: needSearch
        };

       query = { 
        'lat': latitude, 
        'lon': longitude, 
        "radius_meters": radiusMeters, 
        'idPoint': pointName}

    }
    return {inputCoordinateObj, query}

}

const getAdresInputData = async () => {
    clearAdres();
    let query = inputCoordinate().query;
    console.log(query);
    dadataApi(query);
}

const textAreaArray = () => {
    inputCoordinateObj = false
}

const clearInput = () => {
    (function () {
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        document.getElementById('id').value = '';
        document.getElementById('selectNeedSearch').value = false;
    })();
}

const clearAdres = () => {
    let oldAdres = Array.from(document.getElementsByClassName('adres-list')) // Убираем старые списки
    if (oldAdres.length > 0) {
        for (i = 0; i < oldAdres.length; i++) {
            let element = oldAdres[i];
            element.remove();
        }
}
}

const getAdresArr = async () => {
    removeMap();
    clearAdres();
    createWorkArr();
    let adresArr = [];

    if (workArr.length !== 0) {
        for (i = 0; i < workArr.length; i++) {
            let point = JSON.parse(workArr[i]);
            let pointAdres = {
                lat: point.item[0],
                lon: point.item[1],
                idPoint: point.id,
                radiusMeters: point.radiusMeters
            }
            adresArr.push(pointAdres);
        }
    }
   
    for (i=0; i < adresArr.length; i++) {

        let query = adresArr[i]

        dadataApi(query)    
    }
}


