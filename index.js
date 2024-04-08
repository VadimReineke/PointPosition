let loadArrData = [];
let workArr = [];
let inputArr = [];
let inputCoordinateObj = {};
let queryPoint = {};

// зарегистрируйся на dadata.ru и подставь значения API из личного кабинета
let apiKey = '';
let secretKey = '';

const getMap2GisApi = async () => {
    removeMap();
    clearAdres();
    loadArr();

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
        if (loadArrData.length !== 0) {
            for (i = 0; i < loadArrData.length; i++) {
          
                let loadDataPoint = JSON.parse(loadArrData[i]);
                // каждой точке присваиваем уникальный id
                   let point = {
                            ...loadDataPoint,
                            id: (i+1)
                    }
                // создаем массив из которого отрисовываем точки на карте    
               workArr.push(point);

                if (point.lost === 'false') {
                    DG.marker(point.item).addTo(map).bindPopup(point.description)
                } else {
                    DG.marker(point.item, { icon: myIcon }).addTo(map).bindPopup(point.description)
                }
    
            }
        }

        // генерируем точку на карте если данные из формы

        if (inputCoordinateObj !== false) {
            workArr = []
            if (inputCoordinateObj.lost === "false") {
                DG.marker(inputCoordinateObj.item).addTo(map).bindPopup(inputCoordinateObj.description)
            } else (DG.marker(inputCoordinateObj.item, { icon: myIcon }).addTo(map).bindPopup(inputCoordinateObj.description))

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

const dadataApi = async (queryPoint) => {

    let adresContainer = document.getElementById('adres');

    // let queryPoint = adresArr[i]
  
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
            body: JSON.stringify(queryPoint)
        }
    );

    const reserveData = await response.json();
    let adressList = document.createElement('ul');
        adressList.classList.add('adres-list')
    let adressListDescr = document.createElement('p');
        adressListDescr.innerHTML ='Серийный номер ПУ:' + "" + queryPoint.description;
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

const loadArr = () => {
    let value = document.getElementById('textarea').value
    if (value !== '') {
        loadArrData = value.split('\n') // получаем данные из текстареа
        return loadArrData
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
    // Если включить, то карта будет удаляться при получении адресов
    // workArr = []
    // removeMap();

    let latitude = document.getElementById('latitude').value;
    let longitude = document.getElementById('longitude').value;
    let pointName = document.getElementById('description').value;
    let needSearch = document.getElementById('selectNeedSearch').value;
    let radiusMeters = document.getElementById('radiusMeters').value;

    if(radiusMeters === '') {radiusMeters = 0}

    if (latitude != "") {
        inputCoordinateObj = {
            item: [latitude, longitude],
            description: pointName,
            lost: needSearch
        };

       queryPoint = { 
        'lat': latitude, 
        'lon': longitude, 
        "radius_meters": radiusMeters, 
        'description': pointName}

    }
    return {inputCoordinateObj, queryPoint}

}

const getAdresInputData = async () => {
    clearAdres();
    let queryPoint = inputCoordinate().queryPoint;
    dadataApi(queryPoint);
}

const textAreaArray = () => {
    inputCoordinateObj = false
}

const clearInput = () => {
    (function () {
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        document.getElementById('description').value = '';
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
    loadArr();
    let adresArr = [];

    if (workArr.length !== 0) {
        for (i = 0; i < workArr.length; i++) {
            let point = JSON.parse(workArr[i]);
            let pointAdres = {
                lat: point.item[0],
                lon: point.item[1],
                idPoint: point.description,
                radiusMeters: point.radiusMeters
            }
            adresArr.push(pointAdres);
        }
    }
   
    for (i=0; i < adresArr.length; i++) {

        let queryPoint = adresArr[i]

        dadataApi(queryPoint)    
    }
}

// заполнение инпутов по клику по точке
document.addEventListener('click', (e) => {
 if (e.target.classList.contains('leaflet-marker-icon')) {
    let dgData = document.getElementsByClassName('dg-popup__container');
    let searchData = dgData[0].innerHTML;
    let searchPointName = workArr.find(point => point.description === searchData)
    document.getElementById('latitude').value = searchPointName.item[0];
    document.getElementById('longitude').value = searchPointName.item[1];
    document.getElementById('description').value = searchPointName.description;
    document.getElementById('selectNeedSearch').value = searchPointName.lost;
    document.getElementById('radiusMeters').value = searchPointName.radiusMeters;
 }
})

