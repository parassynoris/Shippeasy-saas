import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { shared } from '../../data';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../api-service/api-shared.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css'],
})
export class AgreementComponent implements OnInit , OnDestroy{
  private ngUnsubscribe = new Subject<void>();
  AgreementData = shared.AgreementRow;
  @Input() prentPath: any;
  urlParam: any;
  fromSize: number = 1;
  count = 0;
  toalLength: any;
  currentUrl: any;
  page = 1;
  agreementData: any = [];
  agreementEditData: any;
  name: any = '';
  port = '';
  country = '';
  startdate: any;
  enddate: any;
  size = 10;
  closeResult: string;
  partyid: any='';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private sharedService: ApiSharedService
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.partyid = this.route.snapshot.params['id'];
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData();
  }
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [
            {
              match: {
                parentId: this.partyid,
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.sharedService.listAgreement('agreement', parameter).subscribe((data: any) => {
      this.agreementData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.hits.hits.length
          : this.count + data.hits.hits.length;
    });
  }
  onOpenNew(data) {
    this.agreementEditData = data;
    this.router.navigate([
      this.prentPath + '/' + this.urlParam.key + '/addagreement',
    ]);
  }
  onOpenEdit(id) {
    this.router.navigate([
      this.prentPath + '/' + this.urlParam.key + '/' + id + '/editagreement',
    ]);
  }
  ngOnInit(): void {
    this.prentPath = this.prentPath + '/' + this.urlParam.id;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getData();
  }

  getData() {
    var body = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [
            {
              match: {
                parentId: this.partyid,
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.sharedService.listAgreement('agreement', body).subscribe((res: any) => {
      this.agreementData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }
  search() {
    let mustArray = [];
    let data = {
      match: {
        parentId: this.partyid,
      },
    };
    mustArray.push(data);
    if (this.name) {
      mustArray.push({
        match: {
          AgreementTitle: this.name,
        },
      });
    }
    if (this.port) {
      mustArray.push({
        match: {
          'Port[0].portName': this.port,
        },
      });
    }
    if (this.country) {
      mustArray.push({
        match: {
          'country.countryName': this.country,
        },
      });
    }
    if (this.startdate) {
      mustArray.push({
        match: {
          agreementDate: this.startdate,
        },
      });
    }
    if (this.enddate) {
      mustArray.push({
        match: {
          validTill: this.enddate,
        },
      });
    }

    var parameter = {
      size: 1000,
      from: 0,
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this.sharedService.listAgreement('agreement', parameter).subscribe((res: any) => {
      this.agreementData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }
  clear() {
    this.name = '';
    this.port = '';
    this.country = '';
    this.startdate = '';
    this.enddate = '';
    this.getData();
  }
  delete(deleteagreement, id) {
    this.modalService
      .open(deleteagreement, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = {
              agreementId: id,
              searchKey: 'agreementId',
            };
            const body = [data];

            this.sharedService
              .deleteAgreement('transaction/agreement', body)
              .subscribe((res: any) => {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getData();
              });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  changeStatus(data) {
    this.sharedService.updateAgreement('transaction/agreement',[{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.search();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
