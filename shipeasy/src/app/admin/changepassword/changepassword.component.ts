import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
})
export class ChangepasswordComponent implements OnInit {
  submitted: boolean = false;
  changepassForm: FormGroup; 
  closeResult: string;
  hideCurrentPassword: boolean = false;
  hideNewPassword: boolean = false;
  hideConfirmPassword: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    public notification: NzNotificationService,
    public commonFunctions: CommonFunctions,
    public _cognito: CognitoService,
    public router: Router, 
    public _api: ApiService,
    public commonService: CommonService,
    public modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.changepassForm = this.formBuilder.group({
      username: [{ value: null, disabled: true }],
      userEmail: [{ value: null, disabled: true }],
      currentPassword: [null, [Validators.required]],
      newPassword: [null, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: [null, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
    
    this.getUserList();
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the error if passwords match
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    }
  }

  getUserList() { 
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = { 
        "userId": this.commonFunctions.getAgentDetails()?.userId
      };
    }
    
    this.commonService
      .getSTList('user', payload) 
      ?.subscribe((data) => {
        if (data.documents.length > 0) { 
          this.changepassForm.controls.username.setValue(data.documents[0]?.userName || '');
          this.changepassForm.controls.userEmail.setValue(data.documents[0]?.userEmail || '');
        }
      });
  }

  get f() {
    return this.changepassForm.controls;
  }

  toggleCurrentPassword() {
    this.hideCurrentPassword = !this.hideCurrentPassword;
  }

  toggleNewPassword() {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onConfirm(content1) {
    this.submitted = true;
    
    if (this.changepassForm.invalid) {
      this.notification.create('error', 'Please fill all required fields correctly', '');
      return;
    }

    this.modalService
      .open(content1, {
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
            this.onSave();
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  async onSave() {    
    const payload = {
      userLogin: this.changepassForm.get('username').value,
      userEmail: this.changepassForm.get('userEmail').value,
      currentPassword: this.changepassForm.value.currentPassword,
      newPassword: this.changepassForm.value.newPassword
    };

    this._api.login('user/change-password', payload).subscribe(
      res => {
        if (res) {
          this.notification.create('success', 'Password changed successfully', '');
          setTimeout(() => {
            this.logout();
          }, 1500);
        }
      }, 
      err => {
        // Check if error is related to wrong current password
        const errorMessage = err.error?.message || 'Failed to change password';
        
        if (errorMessage.toLowerCase().includes('current password') || 
            errorMessage.toLowerCase().includes('incorrect password') ||
            errorMessage.toLowerCase().includes('wrong password') ||
            err.status === 401) {
          this.notification.create('error', 'Your current password is wrong. Please try again.', '');
          // Clear only the current password field
          this.changepassForm.patchValue({ currentPassword: '' });
        } else {
          this.notification.create('error', errorMessage, '');
        }
      }
    );
  }

  onCancel() {
    this.changepassForm.reset();
    this.submitted = false;
    this.getUserList(); // Reload user data
  }

  logout() {
    this._cognito.signout().then((res) => {
      this.commonFunctions.Logout(401);
    });
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