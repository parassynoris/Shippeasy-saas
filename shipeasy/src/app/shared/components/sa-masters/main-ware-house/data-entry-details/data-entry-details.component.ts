import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { wareHouse } from '../data';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-data-entry-details',
  templateUrl: './data-entry-details.component.html',
  styleUrls: ['./data-entry-details.component.scss'],
})
export class DataEntryDetailsComponent implements OnInit {
  tabs: any;
  id: any;
  key: any;
  moduleId: any;
  holdControl: any;
  quertParams: any;
  viewMode: any;
  constructor(private route: ActivatedRoute, private router: Router,private commonService:CommonService) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.key = params['key'];
      this.moduleId = params['moduleId'] || null;

    });

    this.route.url.subscribe((segments) => {
      console.log('url', this.route.url);
      console.log('segments', segments);
      if (segments.some((s) => s.path === 'add')) {
        this.viewMode = 'add';
      }
      else if (segments.some((s) => s.path === 'edit')) {
        this.viewMode = 'edit';
      }
      else if (segments.some((s) => s.path === 'show')) {
        this.viewMode = 'show';
      }
      else if (segments.some((s) => s.path === 'clone')) {
        this.viewMode = 'clone';
      }
      else {
        this.viewMode = 'default';
      }
      console.log('this.route.url');
      console.log('viewMode', this.viewMode);
    });
  }

  ngOnInit(): void {
    this.getcontainerList(this.id);
    this.getWarehouseDataEntryById(this.id);
    this.quertParams = this.route.snapshot.queryParams;
    console.log('quertParams', this.quertParams);
    if (this.quertParams && this.quertParams['control']) {
      this.key = this.quertParams['control'];
    }
    if (this.quertParams && this.quertParams['id']) {
      this.id = this.quertParams['id'];
    }
    if (this.quertParams && this.quertParams['moduleId']) {
      this.moduleId = this.quertParams['moduleId'];
    }
    console.log('id', this.id);
    console.log('key', this.key);
    console.log('moduleId', this.moduleId);
    this.holdControl = this.key;
    this.tabs = wareHouse.dataEntryTab;
    console.log('quertParams', this.quertParams);
  }

  onTab(data) {
    this.router.navigate([
      '/warehouse/main-ware-house/details/' + this.id + '/' + data.key,
    ]);
    this.holdControl = data.key;
  }
  filteredTabs: any;
  filterTabsByType() {
    if (!this.type) {
      this.filteredTabs = this.tabs;
      return;
    }

    if (this.type === 'Non Bonded' || this.type === 'non bonded') {
      this.filteredTabs = this.tabs.filter(tab => 
        tab.key === 'space-certificate' ||tab.key === 'inwards' || tab.key === 'packing'   ||  tab.key ==='dispatch'
      );
    } else if (this.type === 'Bonded' || this.type === 'bonded') {
      this.filteredTabs = this.tabs.filter(tab => 
        tab.key !== 'vessel' 
      );
      console.log(this.filteredTabs, "this.filteredTabs");
    } else {
      this.filteredTabs = this.tabs;
    }
    
    // Update tab names based on type
    this.updateTabNames();
  }

  updateTabNames() {
    if (this.filteredTabs) {
      this.filteredTabs = this.filteredTabs.map(tab => {
        if (tab.key === 'space-certificate') {
          return {
            ...tab,
            name: this.getTabNameForSpaceCertificate()
          };
        }
        return tab;
      });
    }
  }

  getTabNameForSpaceCertificate(): string {
    if (this.type === 'Bonded' || this.type === 'bonded') {
      return 'Space Certificate';
    } else if (this.type === 'Non Bonded' || this.type === 'non bonded') {
      return 'Job';
    }
    return 'Space Certificate'; // default
  }

  // Method to get display name for any tab
  getTabDisplayName(tab: any): string {
    if (tab.key === 'space-certificate') {
      return this.getTabNameForSpaceCertificate();
    }
    return tab.name || tab.label || tab.title;
  }

  dataEntryList: any = [];
  type: any;
  
  getWarehouseDataEntryById(id) {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "warehousedataentryId": id,
    }

    this.commonService?.getSTList("warehousedataentry", payload).subscribe((data) => {
      this.dataEntryList = data?.documents[0];
      this.type = data?.documents[0]?.type;
      this.filterTabsByType();
      console.log('dataEntryList', this.dataEntryList);
    })
  }

  containerList: any = [];
  groupedContainers: any = {};
  containerDisplayText: string = '';

  getcontainerList(id) {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "warehousedataentryId": id,
    }

    this.commonService?.getSTList("warehousecontainer", payload).subscribe((data) => {
      this.containerList = data?.documents || [];
      this.groupContainersByType();
    })
  }

  groupContainersByType() {
    // Group containers by containerTypeName
    this.groupedContainers = this.containerList.reduce((acc, container) => {
      const typeName = container.containerTypeName;
      if (acc[typeName]) {
        acc[typeName].count++;
        acc[typeName].containers.push(container);
      } else {
        acc[typeName] = {
          count: 1,
          typeName: typeName,
          containers: [container]
        };
      }
      return acc;
    }, {});

    // Create display text
    this.createContainerDisplayText();
  }

  createContainerDisplayText() {
    const displayParts = Object.keys(this.groupedContainers).map(key => {
      const group = this.groupedContainers[key];
      if (group.count === 1) {
        return `Container ${group.typeName}`;
      } else {
        return `Container ${group.count} * ${group.typeName}`;
      }
    });
    
    this.containerDisplayText = displayParts.join(', ');
  }

  // Alternative method to get container display text directly
  getContainerDisplayText(): string {
    if (!this.containerList || this.containerList.length === 0) {
      return '-';
    }

    const grouped = this.containerList.reduce((acc, container) => {
      const typeName = container.containerTypeName;
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    const displayParts = Object.entries(grouped).map(([typeName, count]: [string, number]) => {
      if (count === 1) {
        return `${typeName}`;
      } else {
        return `${count} * ${typeName}`;
      }
    });

    return displayParts.join(', ');
  }
}