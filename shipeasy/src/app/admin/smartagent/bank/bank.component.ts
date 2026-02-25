import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { BaseBody } from '../base-body';
@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {
  bankData: any = [];
  urlParam: any;
  currentUrl: any;
  bankList: any = [];
  baseBody: BaseBody = new BaseBody();

  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  bankName: any;
  accountNo: any;
  swiftCode: any;
  currency: any;
  branchName: any;
  countryName: any;
  status: any;
  @Input() prentPath: any;
  parentId: any='';
  constructor(private router: Router,
    public commonService: CommonService, private route: ActivatedRoute, private profilesService: ProfilesService) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.parentId = this.route.snapshot.params['id'];
    this.getBankList();
  }

  onOpenNew() {
    var storeId = this.commonService.storeEditID;
    if (storeId !== '' || storeId !== undefined) {
      this.router.navigate(['/register/list/' + this.commonService.storeEditID + '/' + this.urlParam.key + '/add']);
    } else {
      this.router.navigate(['/register/list/' + this.urlParam.key + '/add']);
    }

  }
  onOpenEdit(id) {
    var storeId = this.commonService.storeEditID;
    if (storeId !== '' || storeId !== undefined) {
      this.router.navigate(['/register/list/' + this.commonService.storeEditID + '/' + this.urlParam.key + '/' + id + '/edit']);
    } else {
      this.router.navigate(['/register/list/' + this.urlParam.key + '/' + id + '/edit']);
    }
  }
  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();

  }

  getBankList() {
    this.baseBody = new BaseBody();
   
    let mustArray = [];
    mustArray.push({
      "match": {
        isBank: true,
      }
    })
    if (this.parentId) {
      mustArray.push({
        "match": {
          parentId: this.parentId,
        }
      })
    }
    this.baseBody.baseBody.query.bool.must = mustArray;
    this.profilesService.getBankList(this.baseBody.baseBody)?.subscribe((data) => {
      this.bankList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  onDelete(bankId: any) {
    let deleteBody = [
      {
        bankId: bankId,
        searchKey: "bankId",
      },
    ];
    this.profilesService.deleteBank(deleteBody).subscribe((data: any) => {
      if (data) {
        this.getBankList();
      }
    });
  }

  clear() {
    this.bankName = ''
    this.accountNo = ''
    this.swiftCode = ''
    this.currency = '';
    this.branchName = '';
    this.countryName = '';
    this.status = '';
    this.getBankList()
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getBankList()
  }

  search() {
    let mustArray = [];
    mustArray.push({
      "match": {
        "isBank": true
      }
    })
    if (this.parentId) {
      mustArray.push({
        "match": {
          parentId: this.parentId,
        }
      })
    }
    if (this.bankName) {
      mustArray.push({
        "match": {
          "bankName": this.bankName,
        }
      })
    }
    if (this.accountNo) {
      mustArray.push({
        "match": {
          "accountNo": this.accountNo,
        }
      })
    }
    if (this.swiftCode) {
      mustArray.push({
        "match": {
          "swiftCode": this.swiftCode,
        }
      })
    }
    if (this.currency) {
      mustArray.push({
        "match": {
          "currency": this.currency,
        }
      })
    }
    if (this.branchName) {
      mustArray.push({
        "match": {
          "branchName": this.branchName,
        }
      })
    }
    if (this.countryName) {
      mustArray.push({
        "match": {
          "countryName": this.countryName,
        }
      })
    }
    if (this.status) {
      mustArray.push({
        "match": {
          "status": this.status,
        }
      })
    }

    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this.profilesService.getBankList(parameter).subscribe((data) => {
      this.bankList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let mustArray = [];
    mustArray.push({
      "match": {
        isBank: true,
      }
    })
    if (this.parentId) {
      mustArray.push({
        "match": {
          parentId: this.parentId,
        }
      })
    }
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must":mustArray,
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getBankList(parameter).subscribe((data) => {
      this.bankList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    })
  }

}
