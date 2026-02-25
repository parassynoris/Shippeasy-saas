import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-view-soc-container',
  templateUrl: './view-soc-container.component.html',
  styleUrls: ['./view-soc-container.component.css']
})
export class ViewSocContainerComponent {
  houseBlList :any = []
  constructor( private router: Router, private commonService : CommonService,
    private location: Location,) { }


  back(){
this.location.back();
    this.router.navigate(['list'])
  }
  print(){
    var prepare = [];
    this.houseBlList.forEach(e => {
      var tempObj = [];

      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
      tempObj.push('');
     
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['SR. No.', 'BL No.', 'Container No.', 'Weight', 'POL', 'POD', 'FPOD','Consignee', 'Notify Party']],
      body: prepare
    });
    doc.save('SOC-Container' + '.pdf');
  }
  excel(){
    let storeEnquiryData = [];
    this.houseBlList.map((row: any) => {
      storeEnquiryData.push({
        'SR. No.': '',
        'BL No.': '',
        'Container No.': '',
        'Weight': '',
        'POL': '',
        'POD': '',
        'FPOD': '',
        'Consignee': '',
        'Notify Party': '',
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

    const fileName = 'SOC-Container.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
}
