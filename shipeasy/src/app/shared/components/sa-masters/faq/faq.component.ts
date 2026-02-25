import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
    FAQForm:FormGroup;
    submitted = false;
    categorizedFaqs: any = {};
    faqdata :any=[]
    faqdataDupicate=[]
    holdId: any = 1;
    isSelected: any;
    customerUser: boolean;
    CurrentFaqId: string = "";
    closeResult: string;
    constructor( private formBuilder: FormBuilder,private modalService: NgbModal,private notification: NzNotificationService,private commonService: CommonService,private commonFunctions: CommonFunctions,) { }

    ngOnInit(): void {
    this.FAQForm = this.formBuilder.group({
        categoryType:['',Validators.required],
        question:['',Validators.required],
        answer:['',Validators.required]

    })
    this.getfaqdata()
    this.customerUser = this.commonFunctions.getUserType()
    }
     get f() { return this.FAQForm?.controls; }
    onLeftMenu(id) {
    this.holdId = id;
    }
    getfaqdata() {
    let payload = this.commonService?.filterList()
    this.commonService?.getSTList("faq", payload)?.subscribe((res: any) => {
      this.faqdataDupicate = res?.documents
      this.faqdata = this.convertData(res?.documents)
    });
    }
    convertData = (data) => {
    return ['Inquiry','Booking','Invoice','General']?.map((item, index) => ({
        id: index + 1,
        attributes: {
            title:item,
            faq: data?.filter(tt=>tt?.title==item)?.map((d,index)=>{
               return {
                    ...d,
                    id: index + 1,
                    opened: false,
                    question: d?.question,
                    answer: d?.answer
                }
            })
        }
    }));
    };

    getCategories() {
    return Object.keys(this.categorizedFaqs);
    }

    onSelectTopic(id) {
    this.isSelected = id;
     }
    onenMap(AddFAQ,faqs?) {
      if (faqs) {
        this.CurrentFaqId = faqs?.faqId;
        const FAQDetails = this.faqdataDupicate?.find(faq => faq?.faqId === this.CurrentFaqId)
        this.FAQForm.patchValue({
          categoryType: FAQDetails?.title,
          question: FAQDetails?.question,
          answer: FAQDetails?.answer,
        })

      } else {
        this.CurrentFaqId = ""
      }
    this.modalService?.open(AddFAQ, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    }
    Cancel() {
    this.modalService?.dismissAll();
    this.submitted = false;
    this.FAQForm.reset();
    }

    AddSave(){
    this.submitted = true;
    if (this.FAQForm.invalid) {
    return;
    }
    let payload ={
    title: this.FAQForm?.value?.categoryType,
    question:this.FAQForm?.value?.question,
    answer:this.FAQForm?.value?.answer


    }
    if (this.CurrentFaqId) {
      this.commonService.UpdateToST("faq/" + this.CurrentFaqId, payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.Cancel();
            setTimeout(() => {
              this.getfaqdata()
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error, '');
        }
      );
    }else{
    this.commonService.addToST("faq", payload)?.subscribe(
    (res: any) => {
      if (res) {
        this.notification.create('success', 'Added Successfully', '');
        this.Cancel();
        setTimeout(() => {
            this.getfaqdata()
        }, 1000);
      }
    },
    (error) => {
      this.notification.create('error', error?.error?.error, '');
    }
    );
  }
    }
    onDelete(deletedata, faqs) {
      this.modalService?.open(deletedata, {
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
              let data =  `faq/${faqs?.faqId}`
              this.commonService.deleteST(data).subscribe((res: any) => {
                if (res) {
                  this.notification.create('success', 'Deleted Successfully', '');
                  this.Cancel();
                  setTimeout(() => {
                      this.getfaqdata()
                  }, 1000);
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
  
    }
