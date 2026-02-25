import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  serviceData = [];
  serviceForm: FormGroup;
  serviceIdToUpdate: string = '';
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  category: any;
  type: any;
  tag: any;
  description: any;
  name: any;
  unit: any;
  image: any;
  parent_id: any;
  status: any;
  parent: any;
  uomList: any = [];
  ImageUrl: any;
  serviceImage: string;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private mastersService: MastersService,
    private notification: NzNotificationService,
    private commonService: CommonService,
  ) {
      this.fb = fb;
      this.modalService = modalService;
      this.mastersService = mastersService;
      this.notification = notification;
      this.commonService = commonService;
  }

  ngOnInit(): void {
    this.getServices();
    this.getUomList();
    this.serviceForm = this.fb.group({
      serviceCategory: ['', [Validators.required]],
      serviceType: ['', [Validators.required]],
      serviceTags: [''],
      serviceDescription: [''],
      serviceName: ['', [Validators.required]],
      serviceUnit: ['', [Validators.required]],
      serviceParentId: [''],
      isActive: [false],
      isParent: [false],
    });
  }
  get f() {
    return this.serviceForm.controls;
  }

  getServices() {
    this.page = 1;
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.mastersService.servicesList(parameter).subscribe((data) => {
      this.serviceData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
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
    this.getServices();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.mastersService.servicesList(parameter).subscribe((data) => {
      this.serviceData = data.hits.hits;
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

  search() {
    let mustArray = [];
    if (this.category) {
      mustArray.push({
        wildcard: {
          'serviceCategory': "*" + this.category.toLowerCase() + "*"
        },
      });
    }
    if (this.type) {
      mustArray.push({
        wildcard: {
          'serviceType': "*" + this.type.toLowerCase() + "*"
        },
      });
    }
    if (this.tag) {
      mustArray.push({
        wildcard: {
          'serviceTags': "*" + this.tag.toLowerCase() + "*"
        },
      });
    }
    if (this.description) {
      mustArray.push({
        wildcard: {
          'serviceDescription': "*" + this.description.toLowerCase() + "*"
        },
      });
    }
    if (this.name) {
      mustArray.push({
        wildcard: {
          'serviceName': "*" + this.name.toLowerCase() + "*"
        },
      });
    }
    if (this.unit) {
      mustArray.push({
        wildcard: {
          'serviceUnit': "*" + this.unit.toLowerCase() + "*"
        },
      });
    }
    if (this.image) {
      mustArray.push({
        wildcard: {
          'serviceImage': "*" + this.image.toLowerCase() + "*"
        },
      });
    }
    if (this.parent_id) {
      mustArray.push({
           wildcard: {
          'serviceParentId': "*" + this.parent_id.toLowerCase() + "*"
        },
      });
    }
    if (this.status) {
      mustArray.push({
        wildcard: {
          'isActive': "*" + this.status.toLowerCase() + "*"
        },
      });
    }
    if (this.parent) {
      mustArray.push({
        wildcard: {
          'isParent': "*" + this.parent.toLowerCase() + "*"
        },
      });
    }

    var parameter = {
      size: Number(this.size),
      from: 0,
      query: {
        bool: {
          must: mustArray,
        },
      },
    };

    this.mastersService.servicesList(parameter).subscribe((data) => {
      this.serviceData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  clear() {
    this.category = '';
    this.type = '';
    this.tag = '';
    this.description = '';
    this.name = '';
    this.unit = '';
    this.image = '';
    this.parent_id = '';
    this.status = '';
    this.parent = '';
    this.getServices();
  }
  msdsfileupload(e) {
    this.ImageUrl = e.target.files[0];
    this.serviceImage = e.target.files[0].name;
  }

  getUomList() {
    var parameter = {
      "size": 1000,
      "query": {
        "bool": {
          "must": [{"match": {"status": true}}],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.mastersService.uomList(parameter).subscribe((data) => {
      this.uomList = data.hits.hits;
    });
  }

  async serviceMasters(event) {
    this.submitted = true;
    let status = false
    if(this.ImageUrl){
      const formData = new FormData();
      formData.append('file', this.ImageUrl, `${this.ImageUrl.name}`);
      formData.append('name', `${this.ImageUrl.name}`);
      var data = await this.commonService.uploadDocuments("servicesImage",formData).subscribe();
      status  = true;
    }
    if (status && data) {
      this.ImageUrl = `${this.ImageUrl.name}`
    }
      if (this.serviceForm.invalid) {
        return;
      }
      let newServices = {
        "serviceType": this.serviceForm.value.serviceType,
        "serviceTags": this.serviceForm.value.serviceTags ? this.serviceForm.value.serviceTags : "null",
        "isParent": this.serviceForm.value.isParent,
        "serviceName": this.serviceForm.value.serviceName,
        "isActive": this.serviceForm.value.isActive,
        "serviceCategory": this.serviceForm.value.serviceCategory,
        "orgId": "",
        "serviceUnitId": this.serviceForm.value.serviceUnit,
        "serviceUnit": this.uomList.filter(x => x._source.uomId === this.serviceForm.controls.serviceUnit.value)[0]?._source?.measurement,
        "tenantId": "",
        "serviceDescription": this.serviceForm.value.serviceDescription ? this.serviceForm.value.serviceDescription : "null",
        "serviceImage": this.serviceImage ? this.serviceImage : "null",
        "serviceImageUrl": this.ImageUrl,
        "serviceParentId": this.serviceForm.value.serviceParentId ? this.serviceForm.value.serviceParentId : "null",
        "status": true
      }

      if (!this.serviceIdToUpdate) {
        const data = [newServices];
        this.mastersService.createServices(data).subscribe((res: any) => {
          if (res) {
            this.getServices();
            this.notification.create(
              'success',
              'Added Successfully',
              ''
            );
            this.onSave();
          }

        }, error => {
          this.onSave();
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      } else {
        const dataWithUpdateId = {
          ...newServices,
          serviceId: this.serviceIdToUpdate,
        };
        const data = [dataWithUpdateId];
        this.mastersService.updateServices(data).subscribe((result: any) => {
          if (result) {
            this.getServices();
            this.notification.create(
              'success',
              'Updated Successfully',
              ''
            );
            this.onSave();
          }
        }, error => {
          this.onSave();
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      }
  }


  delete(deleteservice, id) {
    this.modalService
      .open(deleteservice, {
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
              serviceId: id._source.serviceId,
              searchKey: 'serviceId',
            };
            const body = [data];

            this.mastersService.deleteService(body).subscribe((res: any) => {
              if (res) {
                this.getServices();
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                this.clear();
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
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

  open(content, service?: any) {
    if (service) {
      this.serviceIdToUpdate = service?._source.serviceId || '';
      this.serviceImage = service._source.serviceImage,
      this.serviceForm.patchValue({
        serviceCategory: service._source.serviceCategory,
        serviceType: service._source.serviceType,
        serviceTags: service._source.serviceTags,
        serviceDescription: service._source.serviceDescription,
        serviceName: service._source.serviceName,
        serviceUnit: service._source.serviceUnitId,
        serviceParentId: service._source.serviceParentId,
        isActive: service._source.isActive,
        isParent: service._source.isParent,
      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  onSave() {
    this.submitted = false;
    this.modalService?.dismissAll();
    this.serviceIdToUpdate = '';
    this.serviceForm.reset();
    this.serviceForm.controls['serviceParentId'].setValue('');
    this.serviceImage ='';
    this.serviceForm.controls['serviceDescription'].setValue('')
    this.serviceForm.controls['serviceTags'].setValue('')
    this.serviceForm.controls['isActive'].setValue(false)
    this.serviceForm.controls['isParent'].setValue(false)
    this.submitted = false
    return null;
  }
  changeStatus(data) {
    this.mastersService.updateServices([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.serviceData.map((row: any) => {
      storeEnquiryData.push({
        'Service Category': row._source?.serviceCategory,
        'Service Type': row._source?.serviceType,
        'Service Tag': row._source?.serviceTags,
        'Service Description': row._source?.serviceDescription,
        'Service Name': row._source?.serviceName,
        'Unit': row._source?.serviceUnit,
        'Image': row._source?.serviceImage,
        'Parent ID': row._source?.serviceParentId,
        'Status': row._source?.isActive,
        'Parent': row._source?.isParent,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'service.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.serviceData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.serviceCategory);
      tempObj.push(e._source?.serviceType);
      tempObj.push(e._source?.serviceTags);
      tempObj.push(e._source?.serviceDescription);
      tempObj.push(e._source?.serviceName);
      tempObj.push(e._source?.serviceUnit);
      tempObj.push(e._source?.serviceImage);
      tempObj.push(e._source?.serviceParentId);
      tempObj.push(e._source?.isActive);
      tempObj.push(e._source?.isParent);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Service Category','Service Type','Service Tag','Service Description','Service Name','Unit','Image','Parent ID','Status','Parent']],
        body: prepare
    });
    doc.save('service' + '.pdf');
  }
}
