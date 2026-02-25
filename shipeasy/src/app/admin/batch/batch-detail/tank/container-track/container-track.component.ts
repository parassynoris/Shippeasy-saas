import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OrderByPipe } from 'src/app/shared/util/sort';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common/common.service';


@Component({
  selector: 'app-conatiner-track',
  templateUrl: './container-track.component.html',
  styleUrls: ['./container-track.component.scss']
})
export class ConatinerTrackComponent implements OnInit {
  @Input() containerNo = '';
  @Input() showCloseButton: boolean = true;
  map: mapboxgl.Map;
  events: any[] = [];
  truckEvents:any
  startHistoric: any;
  endHistoric: any;
  endPredicted: any;
  vesselEvents: any
  lastTruckEvents:any
  style = 'mapbox://styles/mapbox/streets-v11';
 

  lat = 22.339111;
  lng = 70.818217;
  feederEvents: any;
  railEvents: any;
  constructor(
    private fb: FormBuilder,
    private _api: ApiService,
    public notification: NzNotificationService,
    private modalService: NgbModal,
    private tranService: TransactionService,
    private commonFunctions: CommonFunctions,
    public datepipe: DatePipe,
    private sortPipe : OrderByPipe,
    private cognito : CognitoService,
    public commonService : CommonService,
    private httpClient: HttpClient,
  ){}

  eventsToLineString = (events: any[]): any => {
    const coordinates = events.map(event => [event.longitude, event.latitude]);
    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: coordinates
        }
    };
  };

  ngOnInit(): void {
    mapboxgl as typeof mapboxgl;
    this.map = new mapboxgl.Map({
        accessToken:
            '[REMOVED]',
        container: 'map',
        style: this.style,
        zoom: 2,
        center: [this.lng, this.lat],
    });

    // this.map.on('load', () => {
    //   this.map.setPaintProperty('background', 'background-color', '#ffffff');
    //   this.map.setPaintProperty('water', 'fill-color', '#e2ecf5');
    //   this.map.setPaintProperty('land', 'background-color', '#87a0b9');
    //   this.map.setPaintProperty('road', 'line-color', '#000000');
    //   this.map.setPaintProperty('building', 'fill-color', '#000000');
    // });
 
    this.map.addControl(new mapboxgl.NavigationControl());

    if(this.containerNo){
      this.getrecords(this.containerNo);

    }
}

addMarkers(events: any[], color: string): void {
  events.forEach(event => {
    if (event.transport_call?.location) {
      new mapboxgl.Marker({ color })
        .setLngLat([event.transport_call.location.longitude, event.transport_call.location.latitude])
        .addTo(this.map);
    }
  });
}


  seqData=[];

getrecords(containerNo) {
    let payload = {
      "containerNumber": containerNo || "MRKU5415024"
    };
  
    this.commonService.getcontainer('containerTrack', payload).subscribe((events) => {
      const data = events
      this.seqData = data;
  
      const predictedEvents = events.filter(event => event?.transportmode.toLowerCase() === 'truck');
      const historicalEvents = events.filter(event => event?.transportmode.toLowerCase() === 'vessel');
      // const latestEvents = events.point.positions.filter(event => event?.tag.toLowerCase() === 'latest');
      
      this.addMarkers(predictedEvents, 'red');
      this.addMarkers(historicalEvents, 'blue');
  
      this.fitMapToMarkers([...predictedEvents, ...historicalEvents]);
  
      // Add lines for historical and predicted events
      this.map.addLayer({
        id: 'truck-events-line',
        type: 'line',
        source: {
          type: 'geojson',
          data: this.eventsToLineString(historicalEvents)
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#517b96', 
          'line-width': 3, 
          'line-dasharray': [2, 4] 
        }
      });
      
      this.map.addLayer({
        id: 'vessel-events-line',
        type: 'line',
        source: {
          type: 'geojson',
          data: this.eventsToLineString(predictedEvents)
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#502db2', 
          'line-width': 5
        }
      });
      
      // this.map.addLayer({
      //   id: 'latest-events-circle',
      //   type: 'circle',
      //   source: {
      //     type: 'geojson',
      //     data: {
      //       type: 'FeatureCollection',
      //       features: latestEvents.map(event => ({
      //         type: 'Feature',
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [event.longitude, event.latitude]
      //         },
      //         properties: {}
      //       }))
      //     }
      //   },
      //   paint: {
      //     'circle-radius': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       10,  
      //       5,   
      //       15,  
      //       20  
      //     ],
      //     'circle-color': 'rgba(1, 164, 233, 0.5)', // Semi-transparent blue
      //     'circle-opacity': 0.7
      //   }
      // });

      // Add inner dark blue circle
      // this.map.addLayer({
      //   id: 'latest-events-inner-circle',
      //   type: 'circle',
      //   source: {
      //     type: 'geojson',
      //     data: {
      //       type: 'FeatureCollection',
      //       features: latestEvents.map(event => ({
      //         type: 'Feature',
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [event.longitude, event.latitude]
      //         },
      //         properties: {}
      //       }))
      //     }
      //   },
      //   paint: {
      //     'circle-radius': 8, 
      //     'circle-color': '#003366', 
      //     'circle-opacity': 1 
      //   }
      // });

      const firstHistoricEvent = predictedEvents[0];
      const lastPredictedEvent = historicalEvents[historicalEvents.length - 1];
      
      if (firstHistoricEvent) {
        this.map.addLayer({
          id: 'first-historic-event-circle',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [firstHistoricEvent.longitude, firstHistoricEvent.latitude]
                },
                properties: {}
              }]
            }
          },
          paint: {
            'circle-radius': 10, 
            'circle-color': '#008000', 
            'circle-opacity': 1
          }
        });
      }
      
      if (lastPredictedEvent) {
        this.map.addLayer({
          id: 'last-predicted-event-circle',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [lastPredictedEvent.longitude, lastPredictedEvent.latitude]
                },
                properties: {}
              }]
            }
          },
          paint: {
            'circle-radius': 10, 
            'circle-color': '#008000', 
            'circle-opacity': 1
          }
        });
      }
      
      // let radius = 5;
      // let growing = true;
      // const pulsate = () => {
      //   if (growing) {
      //     radius += 0.5;
      //     if (radius >= 20) growing = false;
      //   } else {
      //     radius -= 0.5;
      //     if (radius <= 5) growing = true;
      //   }
      //   this.map.setPaintProperty('latest-events-circle', 'circle-radius', radius);
      //   requestAnimationFrame(pulsate); 
      // };
      // pulsate();
    });
}


  
  
  fitMapToMarkers(events: any[]): void {
    if (events.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    events.forEach(event => {
      bounds.extend([event.longitude, event.latitude]);
    });

    this.map.fitBounds(bounds, {
      padding: 50, 
      maxZoom: 10,
      animate: true
    });
  }


  setClear() {

    this.modalService.dismissAll();
    return null;
  }

  converDate(date){
    return this.datepipe.transform(date, 'medium');
  }



}
