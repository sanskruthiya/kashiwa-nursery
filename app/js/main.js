const timeRange = ["2025年4月","2025年3月","2025年2月","2025年1月","2024年12月","2024年11月","2024年10月","2024年9月","2024年8月","2024年7月","2024年6月","2024年5月","2024年4月","2024年3月","2024年2月","2024年1月","2023年12月","2023年11月","2023年10月","2023年9月","2023年8月","2023年7月","2023年6月","2023年5月","2023年4月"];
const dataNames = ["nursery_kashiwa_202504.geojson","nursery_kashiwa_202503.geojson","nursery_kashiwa_202502.geojson","nursery_kashiwa_202501.geojson","nursery_kashiwa_202412.geojson","nursery_kashiwa_202411.geojson","nursery_kashiwa_202410.geojson","nursery_kashiwa_202409.geojson","nursery_kashiwa_202408.geojson","nursery_kashiwa_202407.geojson","nursery_kashiwa_202406.geojson","nursery_kashiwa_202405.geojson","nursery_kashiwa_202404.geojson","nursery_kashiwa_202403.geojson","nursery_kashiwa_202402.geojson","nursery_kashiwa_202401.geojson","nursery_kashiwa_202312.geojson","nursery_kashiwa_202311.geojson","nursery_kashiwa_202310.geojson","nursery_kashiwa_202309.geojson","nursery_kashiwa_202308.geojson","nursery_kashiwa_202307.geojson","nursery_kashiwa_202306.geojson","nursery_kashiwa_202305.geojson","nursery_kashiwa_202304.geojson"];
const refSource = ["468/aki07042.pdf","468/aki0703.pdf","468/aki0702.pdf","468/aki070101.pdf","468/aki0612.pdf","468/aki0611.pdf","468/aki0610.pdf","468/aki0609.pdf","468/aki060801.pdf","468/aki0607_1.pdf","468/aki06061.pdf","468/aki0605.pdf","468/aki0604.pdf","468/aki0603.pdf","468/aki0602.pdf","468/aki0601.pdf","468/aki0512.pdf","468/aki0511.pdf","468/aki0510.pdf","468/aki0509.pdf","468/aki0508.pdf","468/aki0507_1.pdf","468/aki0506.pdf","468/aki0505.pdf","468/aki0504.pdf"];

let targetIndex = 0;

const map = L.map('map', {
    zoomControl: false,
    zoomSnap: 0.5,
    minZoom: 12,
    maxZoom: 18,
    condensedAttributionControl: false
}).setView([35.8622,139.9709],13);

L.control.condensedAttribution({
    emblem: '&copy;',
    prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet-Слава Україні!</a> | <a href="https://openstreetmap.org">OpenStreetMap contributors</a> | <a href="https://www.city.kashiwa.lg.jp/haguhagu/index.html" target="_blank">柏市子育て情報 はぐはぐ柏</a> | <a href="https://github.com/sanskruthiya/kashiwa-nursery" target="_blank">Github</a>'
  }).addTo(map);

const bounds = [[36.2000,139.8000], [35.5000,140.4000]];
map.setMaxBounds(bounds);

const basemap_osm = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 28});

const boundary_style = {"fillColor":"transparent", "color":"#ff7800", "weight":5, "opacity": 0.7};
const boundary_layer = new L.geoJson(json_boundary, {style:boundary_style});

const label_marker = {
    radius: 0,
    fillColor: "transparent",
    color: "transparent",
    weight: 0,
    opacity: 0,
    fillOpacity: 1.0
};

const TooltipClass = {
    'className': 'class-tooltip'
};
  
function onEachFeature_label(feature, layer){
    const label = feature.properties.name_tag;
    const tooltipContent = '<p class="tipstyle03">'+label+'</p>';
    layer.bindTooltip(tooltipContent, {permanent: true, direction: 'center', opacity:0.9, ...TooltipClass});
}

const label_layer = new L.geoJson(label_data, {
    onEachFeature: onEachFeature_label,
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng, label_marker);
    }
});

function getStatus_nursery(d) {
    if (d === "〇" || d === "○") {
        return '空きあり';
    } else if (d === "×") {
        return '空きなし';
    } else if (d === "△") {
        return '空きなし・保育体制による受入あり';
    } else if (/^\d+△$/.test(d)) {  // 数値 + △
        return `${d.replace("△", "")}人空きあり`;
    } else if (/^\d+$/.test(d)) {  // 数値のみ
        return `${d}人空きあり`;
    } else {
        return '-';
    }
}

function getColor_nursery(d){
    return d == '-' ? 'gray':
    d == '新設' ? 'blue':
    d == '変更' ? 'blue':
    Number(d) > 9 ? 'red':
    Number(d) > 5 ? 'lightred':
    Number(d) > 2 ? 'orange':
    Number(d) > 0 ? 'green':
    Number(d) == 0 ? 'blue':
    'gray';
}

function onEachFeature_nursery_kl(feature, layer){
    let popupContent;
    
    if (feature.properties.st_status_flag == "既設_保育園"){ //既設園の場合は空き状況と待機人数を表示
        popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        (targetIndex > 0 ? "" : '<tr><td>定員</td><td>'+(feature.properties.st_capacity)+'</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>時間<p class="remarks">(要確認)</p></td><td>開園：'+(feature.properties.st_open_hour)+'<br>'+'保育標準：'+(feature.properties.st_std_time)+'<br>'+'保育短：'+(feature.properties.st_short_time)+'</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>駐車場</td><td>'+(feature.properties.st_parking == "-" ? "確認中" : feature.properties.st_parking+'台')+'</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>対象年齢</td><td>'+(feature.properties.st_age_info)+'</td></tr>')+
        '<tr><td>0歳</td><td>' + (feature.properties.st_age0_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age0_flag)+"（"+(feature.properties.st_age0_num)+"人待ち）")) + '</td></tr>'+
        '<tr><td>1歳</td><td>' + (feature.properties.st_age1_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age1_flag)+"（"+(feature.properties.st_age1_num)+"人待ち）")) + '</td></tr>'+
        '<tr><td>2歳</td><td>' + (feature.properties.st_age2_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age2_flag)+"（"+(feature.properties.st_age2_num)+"人待ち）")) + '</td></tr>'+
        '<tr><td>3歳</td><td>' + (feature.properties.st_age3_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age3_flag)+"（"+(feature.properties.st_age3_num)+"人待ち）")) + '</td></tr>'+
        '<tr><td>4歳</td><td>' + (feature.properties.st_age4_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age4_flag)+"（"+(feature.properties.st_age4_num)+"人待ち）")) + '</td></tr>'+
        '<tr><td>5歳</td><td>' + (feature.properties.st_age5_flag == "-" ? "対象外" : (getStatus_nursery(feature.properties.st_age5_flag)+"（"+(feature.properties.st_age5_num)+"人待ち）")) + '</td></tr>'+
        '</table>';
    }
    else if (feature.properties.st_status_flag == "新設_保育園"){ //新設園の場合は開園時の受入予定人数を表示
        popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        (targetIndex > 0 ? "" : '<tr><td>定員</td><td>'+(feature.properties.st_capacity == "-" ? "確認中" : feature.properties.st_capacity)+'（新年度開園予定）</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>時間<p class="remarks">(要確認)</p></td><td>開園：'+(feature.properties.st_open_hour)+'<br>'+'保育標準：'+(feature.properties.st_std_time)+'<br>'+'保育短：'+(feature.properties.st_short_time)+'</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>駐車場</td><td>'+(feature.properties.st_parking == "-" ? "確認中" : feature.properties.st_parking)+'台（予定）</td></tr>')+
        (targetIndex > 0 ? "" : '<tr><td>対象年齢</td><td>'+(feature.properties.st_age_info)+'</td></tr>')+
        '<tr><td>0歳</td><td>' + (feature.properties.st_age0_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age0_num)+"人受入予定）") + '</td></tr>'+
        '<tr><td>1歳</td><td>' + (feature.properties.st_age1_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age1_num)+"人受入予定）") + '</td></tr>'+
        '<tr><td>2歳</td><td>' + (feature.properties.st_age2_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age2_num)+"人受入予定）") + '</td></tr>'+
        '<tr><td>3歳</td><td>' + (feature.properties.st_age3_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age3_num)+"人受入予定）") + '</td></tr>'+
        '<tr><td>4歳</td><td>' + (feature.properties.st_age4_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age4_num)+"人受入予定）") + '</td></tr>'+
        '<tr><td>5歳</td><td>' + (feature.properties.st_age5_num == "-" ? "新設につき確認中" : "新設（"+(feature.properties.st_age5_num)+"人受入予定）") + '</td></tr>'+
        '</table>';
    }
    else { //それ以外の場合は施設情報のみを表示
        popupContent = 
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        (targetIndex > 0 ? "" : '<tr><td>備考</td><td>'+(feature.properties.st_status_flag)+'('+(feature.properties.st_status_info)+')</td></tr>')+
        '</table>';
    }
    const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
    layer.bindPopup(popupStyle);
}

function onEachFeature_nursery_m(feature, layer){
    if (feature.properties && feature.properties.st_name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        '<tr><td>定員</td><td>'+(feature.properties.st_capacity)+'</td></tr>'+
        '<tr><td>時間<p class="remarks">(要確認)</p></td><td>'+(feature.properties.st_open_hour)+'</td></tr>'+
        '<tr><td>対象年齢</td><td>'+(feature.properties.st_age_info)+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

function onEachFeature_nursery_n(feature, layer){
    if (feature.properties && feature.properties.st_name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

function onEachFeature_childcare(feature, layer){
    if (feature.properties && feature.properties.st_name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.st_name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.st_name)+'" target="_blank">Googleで検索</a>'+(feature.properties.st_url ? (feature.properties.st_url == "-" ? "" : ' ／ <a href="'+(feature.properties.st_url)+'" target="_blank">施設情報サイト</a>') : "") + '</p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.st_type)+'</td></tr>'+
        '<tr><td>備考</td><td>'+(feature.properties.st_status_info ? feature.properties.st_status_info : "-")+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

const nursery_age3_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
                            },
                            onEachFeature: onEachFeature_nursery_kl,
                            pointToLayer: function(feature, latlng){
                                if (feature.properties.st_age3_flag == '新設'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:'新設'})});
                                }
                                else if (feature.properties.st_age3_flag == '-'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'-'})});
                                }
                                else{
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.st_age3_num), prefix:'fa', html:(feature.properties.st_age3_num)})});
                                }
                            }
                        });

const nursery_age2_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                    return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
                            },
                            onEachFeature: onEachFeature_nursery_kl,
                            pointToLayer: function(feature, latlng){
                                if (feature.properties.st_age2_flag == '新設'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:'新設'})});
                                }
                                else if (feature.properties.st_age2_flag == '-'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'-'})});
                                }
                                else{
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.st_age2_num), prefix:'fa', html:(feature.properties.st_age2_num)})});
                                }
                            }
                        });

const nursery_age1_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                    return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
                            },
                            onEachFeature: onEachFeature_nursery_kl,
                            pointToLayer: function(feature, latlng){
                                if (feature.properties.st_age1_flag == '新設'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:'新設'})});
                                }
                                else if (feature.properties.st_age1_flag == '-'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'-'})});
                                }
                                else{
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.st_age1_num), prefix:'fa', html:(feature.properties.st_age1_num)})});
                                }
                            }
                        });

const nursery_age0_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                    return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
                            },
                            onEachFeature: onEachFeature_nursery_kl,
                            pointToLayer: function(feature, latlng){
                                if (feature.properties.st_age0_flag == '新設'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:'新設'})});
                                }
                                else if (feature.properties.st_age0_flag == '-'){
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'-'})});
                                }
                                else if (/^\d|^〇|^○/.test(feature.properties.st_age0_flag)) { // 数値 または 〇/○ で始まる場合
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:'〇'})});
                                }
                                else{
                                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.st_age0_num), prefix:'fa', html:(feature.properties.st_age0_num)})});
                                }
                            }
                        });

const nursery_m_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('M'); //認可外保育ルームを対象にしたレイヤ
                            },
                            onEachFeature: onEachFeature_nursery_m,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:("認外")})});
                            }
                        });

const nursery_n_layer = new L.geoJson([], {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('N'); //幼稚園及び認定こども園のフラグを対象にしたレイヤ
                            },
                            onEachFeature: onEachFeature_nursery_n,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'pink', prefix:'fa', html:("幼")})});
                            }
                        });

const nursery_o_layer = new L.geoJson([], {});

const iconColor_chilcare = 'white';
const markerColor_chilcare = 'cadetblue';

const childcare_p_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('P');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("ほっ")})});
                            }
                        });

const childcare_q_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('Q');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("学童")})});
                            }
                        });

const childcare_r_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('R');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("図書")})});
                            }
                        });

const childcare_u_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('U');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("園庭")})});
                            }
                        });

const childcare_w_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('W');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("はぐ")})});
                            }
                        });

const childcare_y_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('Y');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("相談")})});
                            }
                        });

const childcare_stvx_layer = new L.geoJson(childcare_data, {
                            filter: function(feature, layer) {
                                return feature.properties.uid.startsWith('S') || feature.properties.uid.startsWith('T') || feature.properties.uid.startsWith('V') || feature.properties.uid.startsWith('X');
                            },
                            onEachFeature: onEachFeature_childcare,
                            pointToLayer: function(feature, latlng){
                                return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("他")})});
                            }
                        });

base_dir = './app/data/'

function getData(t) {
    let target_url = base_dir+dataNames[t];
    fetch(target_url)
    .then(response => response.json())
    .then(data => [nursery_age3_layer.addData(data), nursery_age2_layer.addData(data), nursery_age1_layer.addData(data), nursery_age0_layer.addData(data), nursery_m_layer.addData(data), nursery_n_layer.addData(data)])
    //.then(data => [nursery_age3_layer.addData(data), nursery_age2_layer.addData(data), nursery_age1_layer.addData(data), nursery_age0_layer.addData(data), nursery_m_layer.addData(data), nursery_n_layer.addData(data), nursery_j_layer.addData(data)])
    .catch(error => console.log(error));
};

getData(0);

const location_group = L.layerGroup([label_layer, boundary_layer]);
const childcare_group = L.layerGroup([childcare_p_layer, childcare_q_layer, childcare_r_layer, childcare_u_layer, childcare_w_layer, childcare_y_layer, childcare_stvx_layer]);

basemap_osm.addTo(map);
location_group.addTo(map);
nursery_age1_layer.addTo(map);

const info = L.control({position:'bottomleft'});
info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<p class="info-title">柏市の保育園・幼稚園マップ　<select id="period-id" class="period-select"></select></p><p class="comments" id="comment-id"></p>';
    return this._div;
}
info.addTo(map);

const optionLength = timeRange.length;

for (let i = 0; i < optionLength; i++) {
    const selectPeriod = document.getElementById('period-id');
    const optionName = document.createElement('option');
    optionName.value = timeRange[i];
    optionName.textContent = timeRange[i];
    selectPeriod.appendChild(optionName);
}

const iComment = document.getElementById('comment-id');
iComment.innerHTML = '保育園空き状況の情報元は<a href="https://www.city.kashiwa.lg.jp/documents/' + refSource[0] + '" target="_blank">こちら(' + timeRange[0] + ')</a>';

const selectedPeriod = document.querySelector('.period-select');

selectedPeriod.addEventListener('change', function(){
    nursery_age3_layer.clearLayers();
    nursery_age2_layer.clearLayers();
    nursery_age1_layer.clearLayers();
    nursery_age0_layer.clearLayers();
    nursery_m_layer.clearLayers();
    nursery_n_layer.clearLayers();
    targetIndex = selectedPeriod.selectedIndex;
    getData(targetIndex);
    iComment.innerHTML = '保育園空き状況の情報元は<a href="https://www.city.kashiwa.lg.jp/documents/' + refSource[targetIndex] + '" target="_blank">こちら(' + timeRange[targetIndex] + ')</a>';
});

const overlayMaps = {
    '<i class="fas fa-map-marker" style="color:#9932cc"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>認可外保育所': nursery_m_layer,
    '<i class="fas fa-map-marker" style="color:#ff69b4"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>幼稚園・こども園': nursery_n_layer,
    '<i class="fas fa-map-marker" style="color:#5f9ea0"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>子育て支援施設': childcare_group,
    '<i class="fas fa-font" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>ラベル・市界': location_group,
};

const baseMaps = {
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 3歳 待ち人数': nursery_age3_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 2歳 待ち人数': nursery_age2_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 1歳 待ち人数': nursery_age1_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 0歳 待ち人数': nursery_age0_layer,
    '<i class="fas fa-map-marker-alt" style="color:#999"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 非表示': nursery_o_layer
};

const slidemenutitle = '<h3 align="center">柏市保育園・幼稚園マップ<br>（更新：2025年3月1日）</h3>';
let contents ='<p class="remarks" align="center">この説明画面を閉じるには、ここの右斜め上にある <i class="fa fa-backward" style="color:grey"></i> ボタンを押してください。</p>';
contents += '<h2>凡例</h2>'
contents += '<table border="0" bordercolor="#999" cellpadding="5" cellspacing="0"><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:red"></i> :</td><td width="180">10人以上</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:orangered"></i> :</td><td width="180">6人〜9人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:orange"></i> :</td><td width="180">3人〜5人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:green"></i> :</td><td width="180">1人〜2人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:#1E90FF"></i> :</td><td width="180">0人（待機児童なし）</td></tr></table>';
contents += '<h2>説明</h2><p align="left"><ul><li>このウェブページは「<a href="https://www.city.kashiwa.lg.jp/haguhagu/shisetsu/ninteikodomoen/index.html" target="_blank">柏市　こどもをはぐくむ柏市子育てサイト　はぐはぐ柏</a>」の情報を参照して、当サイト管理者が独自に加工・作成したものです。</li>'
contents += '<li>この他に<a href="https://kashiwa.co-place.com/nursery/capacity/" target="_blank">柏市保育園の2024年4月入園者の受入予定人数マップ</a>も公開しています。</li>'
contents += '<li>保育園の空き状況は「<a href="https://www.city.kashiwa.lg.jp/hoikuunei/haguhagu/hokatsu/joho/akijokyo.html" target="_blank">はぐはぐ柏（柏市こども部保育運営課）保育園等の空き状況」</a>を参照しています。</li>'
contents += '<li>各施設の場所の情報は「<a href="https://www.city.kashiwa.lg.jp/kodomoseisaku/haguhagu/kosodatemap/map.html" target="_blank">はぐはぐ柏　子育ててマップ」</a>や「<a href="https://www.city.kashiwa.lg.jp/databunseki/shiseijoho/jouhoukoukai/opendate/childsupport.html" target="_blank">柏市オープンデータ　子育て支援施設」</a>を参照しつつ、当サイト管理者の独自調査も含めて加工しています。</li>'
contents += '<li><span class="style01">柏市内に滞在中であれば</span>、スマートフォンなどお使いの機器の位置情報取得を許可し、<i class="fas fa-crosshairs" style="color:black"></i>　ボタンを押すことで、<span class="style01">現在位置を表示</span>することができます。</li>'
contents += '<li>なお、本ウェブサイトがご利用者様の位置情報等を含め<span class="style01">個人情報を記録することは一切ございません</span>のでご安心ください。</li>'
contents += '<li>ご意見等は<a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a>からお知らせください。</li></ul></p><p align="center"><a href="https://twitter.com/smille_feuille" target="_blank"><i class="fab fa-twitter-square" style="color:lightblue"></i> twitter@Smille_feuille</a></p><hr class="style01">';

if (L.Browser.mobile) {
    L.control.layers(baseMaps, overlayMaps, {collapsed:true}).addTo(map).expand();
}
else{
    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(map);
}

L.control.slideMenu(slidemenutitle + contents, {width:'280px', icon:'fas fa-info'}).addTo(map);
L.control.locate({position:'topleft', icon:'fas fa-crosshairs'}).addTo(map);
L.control.scale({maxWidth:120, metric:true, imperial:false, position: 'topleft'}).addTo(map);
