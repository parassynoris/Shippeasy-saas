import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { Location } from '@angular/common';
import * as XLSX from "xlsx";
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-view-cfs-summary',
  templateUrl: './view-cfs-summary.component.html',
  styleUrls: ['./view-cfs-summary.component.scss']
})
export class ViewCfsSummaryComponent implements OnInit {
  houseBlList: any = []
  csfContainerSummury: any[] = [];
  fpodContainerSummury: any =[];
  constructor(private router: Router,
    private location: Location, private commonService : CommonService,
    private _api: ApiService,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.getBLById()
  }
  getBLById() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "vessel": this.route.snapshot.params['vesId'], 
    }

    this.commonService.getSTList("bl", payload)
      ?.subscribe((res: any) => {
        this.houseBlList = res?.documents;
        this.csfContainerSummury = []
        this.houseBlList?.filter((x) => {
          if (this.csfContainerSummury.find((y) => y?.cfsLocation === x?.cfsLocation)) {
            this.csfContainerSummury.map((z) => {
              if (z?.cfsLocation === x?.cfsLocation) {
                z.containerCount += Number(x?.containers?.length || 0)
                z.nonHaz += Number(this.checkNonHaz(x?.containers))
                z.haz += Number(this.checkHaz(x?.containers))
              }
            })

          } else {
            this.csfContainerSummury.push({
              cfsLocation: x?.cfsLocation,
              nonHaz: Number(this.checkNonHaz(x?.containers)),
              haz: Number(this.checkHaz(x?.containers)),
              containerCount: Number(x?.containers?.length || 0)
            })
          }
        })

        this.houseBlList?.filter((x) => {
          if (this.fpodContainerSummury.find((y) => y?.fpod === x?.importFpodName)) {
            this.fpodContainerSummury.map((z) => {
              if (z?.fpod === x?.importFpodName) {
                z.containerCount += Number(x?.containers?.length || 0)
                z.nonHaz += Number(this.checkNonHaz(x?.containers))
                z.haz += Number(this.checkHaz(x?.containers))
              }
            })

          } else {
            this.fpodContainerSummury.push({
              fpod: x?.importFpodName,
              nonHaz: Number(this.checkNonHaz(x?.containers)),
              haz: Number(this.checkHaz(x?.containers)),
              containerCount: Number(x?.containers?.length || 0)
            })
          }
        })
      });
  }
  checkHaz(data) {
    let count: number = 0
    data.filter((x: any) => {
      if (x?.cargoTypeId === 'HAZ') {
        count++
      }
    })
    return count
  }
  checkNonHaz(data) {
    let count: number = 0
    data.filter((x: any) => {
      if (x?.cargoTypeId !== 'HAZ') {
        count++
      }
    })
    return count
  }
  totalHaz(e?){
    let value: number = 0
    this.csfContainerSummury?.filter((x) => {
      if(e === 'haz'){
        value += Number(x?.haz || 0)
      }
      if(e!='haz'){
        value += Number(x?.nonHaz || 0)
      }
    })
    return value
  }
  totalHazfpod(e?){
    let value: number = 0
    this.fpodContainerSummury?.filter((x) => {
      if(e === 'haz'){
        value += Number(x?.haz || 0)
      }
      if(e!='haz'){
        value += Number(x?.nonHaz || 0)
      }
    })
    return value
  }
  totalContainer() {
    let value: number = 0
    this.csfContainerSummury?.filter((x) => {
      value += Number(x?.containerCount || 0)
    })
    return value
  }
  totalContainerfpod() {
    let value: number = 0
    this.fpodContainerSummury?.filter((x) => {
      value += Number(x?.containerCount || 0)
    })
    return value
  }
  printFod() {
    var divToPrint = document.getElementById("fodSummury");
    var newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }
 
  excelFod(): void {
    let storebatchData = [];
    this.fpodContainerSummury.map((row: any) => {
        storebatchData.push({
          "FPOD Name": row?.fpod,
          "GENERAL FCL / 20": row?.nonHaz,
          "HAZ FCL / 20": row?.haz,
          "Total": row?.containerCount,
          "Container": row?.containerCount,
          "Teus": row?.containerCount,
        });
    });
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(storebatchData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const fileName = "FPOD_Summary.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  printCfs() {
    var divToPrint = document.getElementById("cfsSummury");
    var newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }
  back() {
    this.location.back();
  }
 
  excelCfs(): void {
    let storeEnquiryData = [];
    this.csfContainerSummury.map((row: any) => {
      storeEnquiryData.push({
        "CFS Name": row?.cfsLocation,
        "GENERAL FCL / 20": row?.nonHaz,
        "HAZ FCL / 20": row?.haz,
        "Total": row?.containerCount,
        "Container": row?.containerCount,
        "Teus": row?.containerCount,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'CFS_Summary.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

}
