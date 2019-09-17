'use strict';

System.register(['app/plugins/sdk', 'app/core/time_series2', 'app/core/utils/kbn', 'lodash', './map_renderer', './data_formatter', './libs/baidumap.js', 'jquery'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, TimeSeries, kbn, _, mapRenderer, DataFormatter, MP, $, _typeof, _createClass, panelDefaults, BaidumapCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_map_renderer) {
      mapRenderer = _map_renderer.default;
    }, function (_data_formatter) {
      DataFormatter = _data_formatter.default;
    }, function (_libsBaidumapJs) {
      MP = _libsBaidumapJs.MP;
    }, function (_jquery) {
      $ = _jquery.default;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        ak: "QKCqsdHBbGxBnNbvUwWdUEBjonk7jUj6",
        maxDataPoints: 1,
        theme: "normal",
        latitude: 39.915,
        longitude: 116.404,
        initialZoom: 11,
        valueName: "current",
        locationData: "table",
        icon: "Label",
        esMetric: "Count",
        decimals: 0,
        navigation: true,
        scale: true,
        hideEmpty: false,
        overviewMap: false,
        hideZero: false,
        mapType: true
      };

      BaidumapCtrl = function (_MetricsPanelCtrl) {
        _inherits(BaidumapCtrl, _MetricsPanelCtrl);

        function BaidumapCtrl($scope, $injector, contextSrv) {
          _classCallCheck(this, BaidumapCtrl);

          var _this = _possibleConstructorReturn(this, (BaidumapCtrl.__proto__ || Object.getPrototypeOf(BaidumapCtrl)).call(this, $scope, $injector));

          _this.setMapProvider(contextSrv);
          _.defaults(_this.panel, panelDefaults);

          _this.dataFormatter = new DataFormatter(_this, kbn);
          _this.markers = [];
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));
          //this.loadLocationDataFromFile();
          return _this;
        }

        _createClass(BaidumapCtrl, [{
          key: 'setMapProvider',
          value: function setMapProvider(contextSrv) {
            //    this.tileServer = contextSrv.user.lightTheme ? 'CartoDB Positron' : 'CartoDB Dark';
            this.tileServer = 'CartoDB Positron';
            this.setMapSaturationClass();
          }
        }, {
          key: 'setMapSaturationClass',
          value: function setMapSaturationClass() {
            if (this.tileServer === 'CartoDB Dark') {
              this.saturationClass = 'map-darken';
            } else {
              this.saturationClass = '';
            }
          }
        }, {
          key: 'loadLocationDataFromFile',
          value: function loadLocationDataFromFile(reload) {
            if (this.map && !reload) return;

            if (this.panel.snapshotLocationData) {
              this.locations = this.panel.snapshotLocationData;
              return;
            }

            if (this.panel.locationData === "jsonp endpoint") {} else if (this.panel.locationData === "json endpoint") {
              if (!this.panel.jsonUrl) return;
            } else if (this.panel.locationData === "table") {
              // .. Do nothing

            } else if (this.panel.locationData !== "geohash" && this.panel.locationData !== "json result") {}
          }
        }, {
          key: 'reloadLocations',
          value: function reloadLocations(res) {
            this.locations = res;
            this.refresh();
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            if (this.map) delete this.map;
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Baidumap', 'public/plugins/grafana-baidumap-panel/partials/editor.html', 2);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            if (!dataList) return;
            if (this.dashboard.snapshot && this.locations) {
              this.panel.snapshotLocationData = this.locations;
            }

            var data = [];
            if (this.panel.locationData === "geohash") {
              this.dataFormatter.setGeohashValues(dataList, data);
            } else if (this.panel.locationData === "table") {
              var tableData = dataList.map(DataFormatter.tableHandler.bind(this));
              this.dataFormatter.setTableValues(tableData, data);
            } else if (this.panel.locationData === "json result") {
              var _tableData = dataList.map(DataFormatter.tableHandlers.bind(this));
              this.dataFormatter.setTableValues(_tableData, data);
            } else {
              var _tableData2 = dataList.map(DataFormatter.tableHandler.bind(this));
              this.dataFormatter.setTableValues(_tableData2, data);
            }
            //const datas = this.filterEmptyAndZeroValues(data);

            var datas = data;
            if (_typeof(this.data) === 'object') this.data.splice(0, this.data.length);
            this.markers.splice(0, this.markers.length);
            if (datas.length) {
              this.data = datas;

              this.map ? this.addNode(this.BMap) : this.render();
            } else {
              if (this.map) this.map.clearOverlays();
              this.render();
            }
          }
        }, {
          key: 'addMarker',
          value: function addMarker(point, BMap, data) {
            var myIcon = new BMap.Icon("public/plugins/grafana-baidumap-panel/images/pins6-poi.png", new BMap.Size(30, 30));
            var marker = new BMap.Marker(point, { icon: myIcon });

            this.markers.push(marker);
            if (this.markers.length == this.data.length) {
              var markerClusterer = new BMapLib.MarkerClusterer(this.map, {
                markers: this.markers
              });
            }
            //this.map.setViewport(pointArray);
            marker.enableDragging();
            var scontent = "";
            scontent += '<a href=""><div class="infobox" id="infobox"><div class="infobox-content" style="display:block">';
            scontent += '<div class="infobox-header"><div class="infobox-header-icon"><img src="public/plugins/grafana-baidumap-panel/images/pins6.png"></div>';
            scontent += '<div class="infobox-header-name"><p>' + data.devEUI + '</p></div>';
            scontent += '<div class="infobox-header-type" style="min-width:250px"><p>' + data.type + '</p></div></div>';
            scontent += '<div class="infobox-footer">在线时间：10分钟前</div>';
            scontent += '<div class="infobox-footer-right"></div></div><div class="arrow"></div></div></a>';

            var infoWindow = new BMap.InfoWindow(scontent); // 创建信息窗口对象
            marker.addEventListener("click", function () {
              this.map.openInfoWindow(infoWindow, point); //开启信息窗口
            });

            this.map.addOverlay(marker);
            marker.addEventListener("dragend", function (e) {
              point = new BMap.Point(e.point.longitude, e.point.latitude);
              alert("当前位置：" + e.point.longitude + ", " + e.point.latitude);
            });
          }
        }, {
          key: 'addNode',
          value: function addNode(BMap) {
            var _this2 = this;

            var that = this;
            var list = this.data;
            this.map.clearOverlays();
            console.log(list);
            if (list) {
              var rawLength;
              var translatitudeedElements;
              var i;

              (function () {
                var translatitudeeOne = function translatitudeeOne(index, gps, BMap) {
                  function translatitudeeCallback(returnedData) {
                    if (returnedData.status == 0) {
                      translatitudeedElements.push({
                        index: index,
                        point: returnedData.points[0],
                        rssi: gps.rssi
                      });
                      markerArray.push({ point: returnedData.points[0], data: gps });

                      if (translatitudeedElements.length == rawLength) {
                        translatitudeedElements.sort(function (a, b) {
                          return a.index - b.index;
                        });
                        for (var i = 0; i < translatitudeedElements.length; i++) {
                          lineArray.push(translatitudeedElements[i].point);
                          var heatPoint = { longitude: translatitudeedElements[i].point.longitude, latitude: translatitudeedElements[i].point.latitude, count: translatitudeedElements[i].rssi };
                          heatArray.push(heatPoint);
                        }

                        if (fport == "5") {
                          var setGradient = function setGradient() {
                            var gradient = {};
                            var colors = document.querySelectorAll("input[type='color']");
                            colors = [].slice.call(colors, 0);
                            colors.forEach(function (ele) {
                              gradient[ele.getAttribute("data-key")] = ele.value;
                            });
                            heatmapOverlay.setOptions({ gradient: gradient });
                          };

                          var isSupportCanvas = function isSupportCanvas() {
                            var elem = document.createElement("canvas");
                            return !!(elem.getContext && elem.getContext("2d"));
                          };

                          var ZoomControl = function ZoomControl() {
                            // 默认停靠位置和偏移量
                            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
                            this.defaultOffset = new BMap.Size(10, 10);
                          };

                          //热力图
                          if (!isSupportCanvas()) {
                            alert("热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~");
                          }
                          var heatmapOverlay = new BMapLib.HeatmapOverlay({ radius: 20 });
                          that.map.addOverlay(heatmapOverlay);
                          heatmapOverlay.setDataSet({ data: heatArray, max: 100 });

                          ZoomControl.prototype = new BMap.Control();
                          ZoomControl.prototype.initialize = function (map) {
                            var div = document.createElement("div");
                            var content = '<div id="heatmap_mark"><div><span class="heatmap_mark_title">颜色对应RSSI信号强度</span> <span class="heatmap_mark_text" style="float:right;padding-top:5px" id="heatmap_mark_density">dBm</span></div><div class="linear_color"></div><span class="heatmap_blue heatmap_mark_text heatmap_color_span">-60以下</span><span class="heatmap_green heatmap_mark_text heatmap_color_span">-60至-80</span><span class="heatmap_yellow heatmap_mark_text heatmap_color_span">-80至-100</span><span class="heatmap_red heatmap_mark_text heatmap_color_span">-100至-120</span><span class="heatmap_result_red heatmap_mark_text heatmap_color_span">-120以上</span></div>';
                            div.innerHTML = content;

                            that.map.getContainer().appendChild(div);
                            return div;
                          };

                          var myZoomCtrl = new ZoomControl();
                          that.map.addControl(myZoomCtrl);
                        } else if (fport == "33") {
                          var polyline = new BMap.Polyline(lineArray, {
                            enableEditing: false,
                            enableClicking: true,
                            strokeWeight: "4",
                            strokeOpacity: 0.5,
                            strokeColor: "blue"
                          });
                          that.map.addOverlay(polyline);
                        } else {
                          for (var _i in markerArray) {
                            that.addMarker(markerArray[_i].point, BMap, markerArray[_i].data);
                          }
                        }
                      }
                    } else {
                      console.log("转换出错: " + returnedData.status);
                    }
                  }
                  // 转换坐标
                  var point = new BMap.Point(gps.longitude, gps.latitude);
                  convertor.translatitudee(new Array(point), 1, 5, translatitudeeCallback);
                };

                var fport = _this2.data[0].fport;
                var lineArray = [];
                var heatArray = [];
                var markerArray = [];
                var convertor = new BMap.Convertor();

                rawLength = 0;
                translatitudeedElements = [];


                for (i = 0; i < list.length; i++) {
                  setTimeout(function (index) {
                    return function () {
                      if (list[index].longitude > 0 && list[index].latitude > 0) {
                        rawLength++;
                        translatitudeeOne(index, list[index], BMap);
                      }
                    };
                  }(i), i * 10);
                }
              })();
            }
          }
        }, {
          key: 'filterEmptyAndZeroValues',
          value: function filterEmptyAndZeroValues(data) {
            var _this3 = this;

            return _.filter(data, function (o) {
              return !(_this3.panel.hideEmpty && _.isNil(o.value)) && !(_this3.panel.hideZero && o.value === 0);
            });
          }
        }, {
          key: 'onDataSnapshotLoad',
          value: function onDataSnapshotLoad(snapshotData) {
            this.onDataReceived(snapshotData);
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'setNewMapCenter',
          value: function setNewMapCenter() {
            this.render();
          }
        }, {
          key: 'setZoom',
          value: function setZoom() {
            this.map.setZoom(parseInt(this.panel.initialZoom, 10) || 1);
          }
        }, {
          key: 'setStyle',
          value: function setStyle() {
            this.map.setMapStyle({ style: this.panel.theme });
          }
        }, {
          key: 'setAK',
          value: function setAK() {
            var x = document.body;
            var s = document.getElementsByTagName("script");
            var len = s.length;
            x.removeChild(s[len - 1]);
            delete this.map;
            this.render();
          }
        }, {
          key: 'navigationControl',
          value: function navigationControl() {
            if (this.panel.navigation == true) {
              this.map.addControl(this.navigationSwitch);
            } else {
              this.map.removeControl(this.navigationSwitch);
            }
          }
        }, {
          key: 'scaleControl',
          value: function scaleControl() {
            if (this.panel.scale == true) {
              this.map.addControl(this.scaleSwitch);
            } else {
              this.map.removeControl(this.scaleSwitch);
            }
          }
        }, {
          key: 'overviewMapControl',
          value: function overviewMapControl() {
            if (this.panel.overviewMap == true) {
              this.map.addControl(this.overviewMapSwitch);
            } else {
              this.map.removeControl(this.overviewMapSwitch);
            }
          }
        }, {
          key: 'mapTypeControl',
          value: function mapTypeControl() {
            if (this.panel.mapType == true) {
              this.map.addControl(this.mapTypeSwitch);
            } else {
              this.map.removeControl(this.mapTypeSwitch);
            }
          }
        }, {
          key: 'resize',
          value: function resize() {}
        }, {
          key: 'toggleStickyLabels',
          value: function toggleStickyLabels() {
            console.log(this.panel.stickyLabels);
          }
        }, {
          key: 'changeLocationData',
          value: function changeLocationData() {
            if (this.panel.locationData === 'geohash') {
              this.render();
            }
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            mapRenderer(scope, elem, attrs, ctrl);
          }
        }]);

        return BaidumapCtrl;
      }(MetricsPanelCtrl);

      _export('default', BaidumapCtrl);

      BaidumapCtrl.templatitudeeUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=baidumap_ctrl.js.map
