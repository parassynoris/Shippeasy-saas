import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-vessel-map-new',
  templateUrl: './vessel-map-new.component.html',
  styleUrls: ['./vessel-map-new.component.scss']
})
export class VesselMapComponentNew implements OnInit {
  @Input() mmsiNo;
  @Input() vesselName;
  @Input() showIcon;
  mmsiNumber:any;
  url:any;
  vesseltrack=false
  constructor(private sanitizer:DomSanitizer,private notification:NzNotificationService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.trackVessel(this.mmsiNo)
  }
  trackVessel(mmsi) {
    this.vesseltrack=false
    this.mmsiNumber = mmsi
    if (!this.mmsiNumber) {
      this.notification?.create('error', 'Tracking Id Not Available, Please Update MMSI In Vessel', '');
    } else {
      try {
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.marinetraffic.com/en/ais/embed/zoom:9/centery:37.446/centerx:24.9467/maptype:1/shownames:false/mmsi:" + this.mmsiNumber + "/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:true/remember:false")
        this.vesseltrack = true
      } catch (error) {
        this.notification.create('error', 'Something Went Wrong, Please Update MMSI In Vessel', '');
      }

    }
  }
  onClose() {
    this.modalService.dismissAll()
  }
  
}
