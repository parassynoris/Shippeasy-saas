import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-add-agent',
  templateUrl: './add-agent.component.html',
  styleUrls: ['./add-agent.component.scss'],
})
export class AddAgentComponent implements OnInit {


  currentUrl: any;
  importAgentAdviceDetail: any;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
   this.importAgentAdviceDetail = this.commonService.agentAdviseData
  }

  onClose() {
    this.router.navigate(['/agent-advice/list']);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }



}
