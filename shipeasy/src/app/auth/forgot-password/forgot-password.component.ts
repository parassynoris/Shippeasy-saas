import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { ContactUsComponent } from 'src/app/layout/contact-us/contact-us.component';
import { HelpComponent } from 'src/app/layout/help/help.component';
import { PrivacyComponent } from 'src/app/layout/privacy/privacy.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent  {
  showloader: boolean = false;
  @ViewChild('recordadded', { static: false }) recordadded;
  apimessage: any;
  forgotForm: FormGroup;
  showresentlink: boolean;
  closeResult: string;
  username: any;
  submitted: boolean;
  constructor(
    private modalService : NgbModal,
    private fb: FormBuilder, private route: ActivatedRoute,
    public router: Router,
    public notification: NzNotificationService,
    public _api : ApiService
  ) {
    this.forgotForm = this.fb.group({
      username: [null, [Validators.required]],
      userEmail : [null, [Validators.required,Validators.email, ForgotPasswordComponent.noWhiteSpaceAny ]]
    });

  }
  get f() { return this.forgotForm.controls; }

  forgetpassword() {
    this.submitted = true;
    
    // Check if the form is invalid
    if (this.forgotForm.invalid) {
      // Check for specific errors and display appropriate messages
      if (this.forgotForm.controls.username.errors) {
        if (this.forgotForm.controls.username.errors.required) {
          this.notification.create('error', 'Please enter your username', '');
        } else if (this.forgotForm.controls.username.errors.pattern) {
          this.notification.create('error', 'Enter a valid username', '');
        }
      }
  
      if (this.forgotForm.controls.userEmail.errors) {
        if (this.forgotForm.controls.userEmail.errors.required) {
          this.notification.create('error', 'Please enter your email address', '');
        } else if (this.forgotForm.controls.userEmail.errors.email) {
          this.notification.create('error', 'Enter a valid email ID', '');
        }
      }
  
      return false;
    }
  
    let payload = {
      userLogin: this.forgotForm.value.username,
      userEmail: this.forgotForm.value.userEmail
    };
  
    this._api.login('user/reset', payload).subscribe(
      res => {
        if (res) {
          this.notification.create('success', `A new password has been sent to your registered email address`, '');
          this.router.navigate(['login']);
        }
      },
      error => {
        this.notification.create('error',  error?.error?.message ? error?.error?.message : error.message ? error?.message :  'Please enter Valid Username or Email',  '');
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

  static noWhiteSpaceAny(string): any {
    if (string.pristine) {
      return null;
    }
    const noWhitespace = /^\S*$/;
    string.markAsTouched();
    if (noWhitespace.test(string.value)) {
      return null;
    }
    return {
      noWhitespace: true
    };
  }
  numericOnly(event: any): boolean {
    const charcode = event.which ? event.which : event.keyCode;
    if (charcode >= 48 && charcode <= 57) {
      return true;
    }
    return false;
  }
  loginWithGoogle(): void {
    // Handle login with Google
  }

  loginWithFacebook(): void {
    // Handle login with Facebook
  }
  onOpenHelp() {
    this.modalService.open(HelpComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }
  onOpenContact() {
    this.modalService.open(ContactUsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }
  onOpenSupport() {
    this.modalService.open(PrivacyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }

}
