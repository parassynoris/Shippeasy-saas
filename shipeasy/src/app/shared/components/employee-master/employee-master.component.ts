import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-master',
  templateUrl: './employee-master.component.html',
  styleUrls: ['./employee-master.component.scss'],
})
export class EmployeeMasterComponent implements OnInit {
  fromSize: number = 1;
  count = 0;
  toalLength: any;
  size = 10;
  page = 1;
  submitted: boolean = false;
  employeeData: any = [];
  idToUpdate : string = '';
  employeeForm: FormGroup;
  empNameSearch: any;
  designationSearch: any;
  deptNameSearch: any;
  branchSearch: any;
  companyNameSearch: any;
  lobSearch: any;
  show: any;
  deptData: any;
  isParent: any;
  parentId :any  = ''
  constructor(
    public modalService: NgbModal,
    private commonService: CommonService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
  ) {
    this.parentId =  this.route.snapshot?.params['id']
  }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      empName: ['', [Validators.required]],
      deptName: ['', [Validators.required]],
      designation: [''],
      companyName: [''],
      branch: [''],
      lob: [''],
      remark: [''],
      status: [true],
    });
    this.getEmployees();
   this.getDepartmentList()
  }

  getEmployees() {
    let payload = this.commonService?.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = {   parentId: this.parentId,}
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService?.getSTList('employee',payload)
      .subscribe((res: any) => {
        this.employeeData = res.documents;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
      });
  }

  open(content, employee?: any,show?) {
    this.show = show
    if (employee) {
      this.idToUpdate = employee.employeeId || '';
      this.employeeForm.patchValue({
        empName: employee?.emp_name,
        deptName: employee?.deptId,
        designation: employee?.designation,
        companyName: employee?.company_name,
        branch: employee?.branch,
        lob: employee?.lob,
        remark: employee?.remark,
        status: employee?.status,

      });
      show === 'show'?this.employeeForm.disable():this.employeeForm.enable()
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  search() {
    let mustArray = {};

 
    if (this.empNameSearch) {
      mustArray['emp_name'] = {
        "$regex" : this.empNameSearch,
        "$options": "i"
    }
    }
    if (this.designationSearch) {
      mustArray['designation'] = {
        "$regex" : this.designationSearch,
        "$options": "i"
    }
    }
    if (this.deptNameSearch) {
      mustArray['dept_name'] = {
        "$regex" : this.deptNameSearch,
        "$options": "i"
    }
    }
    if (this.branchSearch) {
      mustArray['branch'] = {
        "$regex" : this.branchSearch,
        "$options": "i"
    }
    }
    if (this.companyNameSearch) {
      mustArray['company_name'] = {
        "$regex" : this.companyNameSearch,
        "$options": "i"
    }
    }
    if (this.lobSearch) {
      mustArray['lob'] = {
        "$regex" : this.lobSearch,
        "$options": "i"
    }
    }
    mustArray['parentId'] = this.parentId
    let payload = this.commonService?.filterList()

    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService?.getSTList('employee',payload)
      .subscribe((data: any) => {
        this.employeeData = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize =1
      });
  }

  clear() {
    this.empNameSearch = '';
    this.designationSearch = '';
    this.deptNameSearch = '';
    this.branchSearch = '';
    this.companyNameSearch = '';
    this.lobSearch = '';
    this.getEmployees();
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getEmployees();
  }
  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService?.filterList()

     if(payload?.size) payload.size =Number(this.size);
      payload.from = this.fromSize - 1;
      payload.query = { 
        parentId: this.parentId
       }
      payload.sort = {
        "desc" : ["updatedOn"]
      }, 
      this.commonService?.getSTList('employee',payload)
      .subscribe((data: any) => {
        this.employeeData = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count =
          type === 'prev'
            ? this.toalLength === this.count
              ? this.count - (this.toalLength % Number(this.size))
              : this.count - data.documents.length
            : this.count + data.documents.length;
      });
  }

  onSave() {
    this.modalService.dismissAll();
    this.idToUpdate = '';
    this.employeeForm.reset();
    this.submitted = false;
  }

  saveEmployee() {
    this.submitted = true;
    if (!this.employeeForm.valid) {
      return;
    }

    let deptName = this.deptData.filter((x) => x?.deptName === 
    this.employeeForm.value.deptName)[0]?.deptName
    let formdata = this.employeeForm.value;
    let payload = [
      {
        status: formdata.status,
        dept_name: deptName || '',
        deptId: formdata.deptName || '',
        company_name: formdata.companyName || '',
        branch: formdata.branch || '',
        employeeId: this.idToUpdate ? this.idToUpdate : '0',
        emp_Id: '0',
        emp_name: formdata.empName || '',
        designation: formdata.designation || '',
        remark: formdata.remark || '',
        lob: formdata.lob || '',
        parentId: this.parentId || '',
      },
    ];
    let url = this.commonService.addToST(`employee`,payload[0])
    if (this.idToUpdate) {
      url = this.commonService.UpdateToST(`employee/${ payload[0].employeeId}`, payload[0]);
    }
    url.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Employee Saved Successfully',
            ''
          );
          this.onSave();
          var myInterval = setInterval(() => {
            this.getEmployees();
            clearInterval(myInterval);
          }, 2000);
        }
      },
      (err) => {
        this.notification.create('error', err?.error?.error?.message, '');
        this.onSave();
      }
    );
  }

  employeeStatusChange(event, employee?) {
    let payload = [
      {
        status: event,
        employeeId: employee?.employeeId,
      },
    ];
    this.commonService
      .UpdateToST(`employee${ payload[0].employeeId}`, payload[0])
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Saved Successfully',
              ''
            );
            this.getEmployees();
          }
        },
        (err) => {
          this.notification.create('error', err?.error?.error?.message, '');
        }
      );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.employeeData.map((row: any) => {
      storeEnquiryData.push({
        'Employee Name': row.emp_name,
        'Designation': row.designation,
        'Department Name': row.dept_name,
        'Branch': row.branch,
        'Company Name': row.company_name,
        'Lob': row.lob,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'employee-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  getDepartmentList() {
    let payload = this.commonService?.filterList()
   if(payload?.query) payload.query = {
      status: true,
    }
    if(this.parentId){
      if(payload?.query) payload.query['parentId'] = this.parentId
    }
    this.commonService?.getSTList('department',payload) .subscribe((data) => {
      this.deptData = data.documents;
      
    });
  }
  openPDF() {
    var prepare=[];
    this.employeeData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.emp_name);
      tempObj.push(e.designation);
      tempObj.push(e.dept_name);
      tempObj.push(e.branch);
      tempObj.push(e.company_name);
      tempObj.push(e.lob);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Employee Name','Designation','Department Name','Branch','Company Name','LOD']],
        body: prepare
    });
    doc.save('employee-master' + '.pdf');
  }
}
