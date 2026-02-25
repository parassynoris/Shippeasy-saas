import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-voyage',
  templateUrl: './voyage.component.html',
  styleUrls: ['./voyage.component.scss']
})
export class VoyageComponent implements OnInit {

  currentUrl: any;
  urlParam: any;
  voyageIdToUpdate: string;
  voyageData=[];
  voyageForm:FormGroup;
  constructor(private router: Router,private fb: FormBuilder, private route: ActivatedRoute, private modalService: NgbModal,private mastersService:MastersService) {
    this.router = router;
    this.fb = fb;
    this.route=route;
    this.modalService = modalService;
    this.mastersService = mastersService
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
  }

  onOpenVoyage(){
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }

  onCloseNew(){
    this.router.navigate(['/master/' + this.urlParam.key]);
  }

  onEdit(id){
    this.router.navigate(['/master/' + this.urlParam.key +'/'+ id + '/edit']);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
   this.getVoyage();
   this.voyageForm = this.fb.group({
    itemCategory: ['', [Validators.required]],
    vesselType:['', [Validators.required]],
    shippingLine: ['', [Validators.required]],
    birthName:['', [Validators.required]],
    terminalId:['', [Validators.required]],
    vesselOwner:['', [Validators.required]],
  })
  }
  getVoyage(){
    this.mastersService.voyageList()?.subscribe(data =>{
      this.voyageData=data.hits.hits;
     
    })
  }

  voyageMasters(){
    if(this.voyageForm.invalid) {
      return;
    }
    let newCostItems = this.voyageForm.value;

    if(!this.voyageIdToUpdate) {
      const data = [newCostItems];
      this.mastersService.createVoyage(data).subscribe(() =>{
        
        this.onSave();
        this.getVoyage();
      });
    } else {
      const dataWithUpdateID = {...newCostItems, voyageId: this.voyageIdToUpdate  }
      const data1 = [dataWithUpdateID];
      this.mastersService.updateVoyage(data1).subscribe(() =>{
        
        this.getVoyage();
        this.onSave();
      });
    }



  }
  open(content, voyage?: any) {

    if(voyage) {
      this.voyageIdToUpdate = voyage?._source.voyageId;
      this.voyageForm.patchValue({
        itemCategory:voyage._source.itemCategory,
        vesselType:voyage._source.itemType,
        shippingLine:voyage._source.itemTags,
        birthName:voyage._source.costitemName,
        terminalId:voyage._source.itemUnit,
        vesselOwner:voyage._source.itemImage,
      })
    }
    
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    }
    )
  }
  onSave() {
    this.voyageIdToUpdate = null;
    this.voyageForm.reset();
    this.modalService.dismissAll();
    return null;
  }


}
