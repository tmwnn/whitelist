import {loadYmap} from "vue-yandex-maps";

const settings = {
    apiKey: '8e4786fc-90ed-4f4f-88fd-ff9af3afa82c',
    lang: 'ru_RU',
    coordorder: 'latlong',
    enterprise: false,
    version: '2.1'
};
import axios from 'axios';
let selectCity = 'Санкт-Петербург';


const getGeoCode = async (location) => {
    let pos = null;
    if (location) {
        let geoUrl = `https://geocode-maps.yandex.ru/1.x?geocode=${location}&apikey=${settings.apiKey}&format=json`;
        const geoRes = await axios.get(geoUrl);
        const resArr = geoRes.data.response.GeoObjectCollection.featureMember !== 'undefined' ? geoRes.data.response.GeoObjectCollection.featureMember : [];
        if (resArr.length) {
            let coords = resArr[0].GeoObject.Point.pos.split(' ');
            pos = [coords[1], coords[0]];
        }
    }
    return pos;
}
const getSelectCity = async (coords) => {
    let city = '';
    if (location) {
        const geoRes = await axios.get(`https://geocode-maps.yandex.ru/1.x?geocode=${coords[1]},${coords[0]}&apikey=${settings.apiKey}&format=json`);
        const resArr = geoRes.data.response.GeoObjectCollection.featureMember !== 'undefined' ? geoRes.data.response.GeoObjectCollection.featureMember : [];
        if (resArr.length) {
            city = (resArr[0].GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName);
        }
    }
    return city;
}

const getGeoLocation = async () => {
    let coords = [60, 30];
    await loadYmap(settings);
    if (typeof (ymaps) != 'undefined') {
        /*eslint-disable */
        let geoLocation = await ymaps.geolocation.get();
        coords = geoLocation.geoObjects.get(0).geometry.getCoordinates();
        /*eslint-enable */
        selectCity = await getSelectCity(coords);
    }
    return coords;
}

export {settings, selectCity, getGeoCode, getGeoLocation, }