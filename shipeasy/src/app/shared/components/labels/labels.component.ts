import { Component } from '@angular/core';
import labelData from '../../../../assets/i18n/en.json';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import masterLabel from '../../../../assets/i18n/master.json';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent {

  allLabels = masterLabel;
  newLabels = labelData;
  labelTag = Object.keys(this.allLabels);
  isChangesDone: boolean = false;
  constructor(private apiService: ApiService,
    private notification: NzNotificationService,
    private commonService: CommonService) {
    // do nothing.
  }

  getNextObj(key) {
    if (typeof this.allLabels[key] === 'object') {
      return this
    }
  }

  doCheck(key) {
    if (typeof (key.value) === 'object') {
      return true;
    }
    else {
      return false;
    }
  }

  handleLabel(label, item, ev) {
    this.newLabels[item][label.key] = ev.target.value;
    this.isChangesDone = true;
  }

  handleLabelOfLastLabel(label, lastLabel, item, ev) {
    this.newLabels[item][label.key][lastLabel.key] = ev.target.value;
    this.isChangesDone = true;
  }
  handleLabelOfGoDeep(label, newLabel, labelNew, item, ev) {
    this.newLabels[item][label.key][newLabel.key][labelNew.key] = ev.target.value;
    this.isChangesDone = true;
  }
  handleLabelOfGoAhead(label, newLabel, item, ev) {
    this.newLabels[item][label.key][newLabel.key] = ev.target.value;
    this.isChangesDone = true;
  }
  onSave() {
    let data = [{
      id: "",
      json: this.newLabels
    }];
    var url = Constant.SAVE_USER;

    const blob = new Blob([JSON.stringify(this.newLabels)], { type: 'text/plain' });
    const tmpFile = new File([blob], 'en.json');

    const formData = new FormData();
      formData.append('file', tmpFile, 'en.json');
      formData.append('name', 'en.json');
    this.commonService.uploadDocuments( 'Principal',formData);
   
  }
}
