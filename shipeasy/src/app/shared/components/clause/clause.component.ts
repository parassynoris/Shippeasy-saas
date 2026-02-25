import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AddclauseComponent } from './addclause/addclause.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../api-service/api-shared.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-clause',
  templateUrl: './clause.component.html',
  styleUrls: ['./clause.component.css']
})
export class ClauseComponent implements OnInit , OnDestroy , OnChanges {
  private ngUnsubscribe = new Subject<void>();
  @Input() prentPath: any;
  clauseData: any = [];
  currentUrl: any;
  isHoldType: any = 'add';
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  result: any;
  closeResult: string;
  partyid: any='';
  clauseName: string;
  startDate: string;
  remark: string;
  

  constructor(
    public modalService: NgbModal,
    private route: ActivatedRoute,
    public sharedService: ApiSharedService,
    public notification: NzNotificationService
  ) { 
    this.partyid = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getAll()
  }

  ngOnChanges(){
    this.getAll(); 
  }

  open(type, guid) {
    const modalRef = this.modalService.open(AddclauseComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.fromParent = guid;
     modalRef.componentInstance.parentId =  this.partyid;
     modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getAll()
      }
    })
  }
  onEdit(content, guid: any) {
    this.open(content, guid);
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getAll();
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }
  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": [
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.sharedService.getList("clause", parameter).subscribe(data => {
      this.result = data;
      this.toalLength = this.result.hits.total.value;
      this.clauseData = this.result.hits.hits;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - this.result.hits.hits.length : this.count + this.result.hits.hits.length
    })
  }

  getAll() {
    var parameter = {
      "size": Number(this.size),
      "from": this.page-1,
      "query": {
        "bool": {
          "must": [
            {
              match: {
                parentId: this.partyid,
              },
            },
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.sharedService.getList1("clause", parameter).subscribe(data => {
      this.result = data;
      this.toalLength = this.result.hits.total.value;
      this.clauseData = this.result.hits.hits;
      this.count = this.result.hits.hits.length
    })
  }

  onDelete(deletedepartment, id) {
    this.modalService.open(deletedepartment, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result === 'yes') {
        let data = {
          "clauseId": id,
          "searchKey": "clauseId"
        }
        const body = [data]
        this.sharedService.delete1('master/clause/delete', body).subscribe(res => {
          if (res) {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
            this.getAll();
          }
        });
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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
  changeStatus(data) {
    this.sharedService.updateRecord("master/clause/update",[{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.getAll();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  search() {
    let mustArray = [];
    let data = {
      match: {
        parentId: this.partyid,
      },
    };
    mustArray.push(data);
    if (this.remark) {
      mustArray.push({
        match: {
          remarks: this.remark,
        },
      });
    }
    if (this.clauseName) {
      mustArray.push({
        match: {
          'clauseName': this.clauseName,
        },
      });
    }
    if (this.startDate) {
      mustArray.push({
        match: {
          'StartDate': this.startDate,
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
    this.sharedService.getList1("clause", parameter).subscribe(data => {
      this.result = data;
      this.toalLength = this.result.hits.total.value;
      this.clauseData = this.result.hits.hits;
      this.count = this.result.hits.hits.length
    });
  }
  clear() {
    this.clauseName = '';
    this.startDate = '';
    this.remark = '';
    this.getAll();
  }
}
