import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { ConfirmPasswordValidator } from './validator/confirm-password-validator.validator';
import { WhiteSpaceValidator } from './whitespace.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent  {

  @ViewChild('recordadded', { static: false }) recordadded;
	apimessage : any;
	showloader: boolean = false;
	issubmit: boolean = false;
	username : any;
	code:string
	resetPasswordForm: FormGroup;
	public showPasswordText: boolean = false;
	public showConfirmPasswordText : boolean = false;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private cognitoService:CognitoService,
    private notification: NzNotificationService,
	)
	{
		if (this.router.getCurrentNavigation().extras?.state !== null) {
			let stateData = this.router.getCurrentNavigation().extras.state;
			this.username = stateData['username'];
		}else{
			this.router.navigateByUrl('/forgot-password');
		}

		this.resetPasswordForm = this.fb.group({
			password: [null, [Validators.required,
				Validators.minLength(8),
				Validators.maxLength(15),
				WhiteSpaceValidator.noWhiteSpace,
				Validators.compose([
					Validators.required,
					// check whether the entered password has a number
					this.patternValidator(/\d/, {
						hasNumber: true
					}),
					// check whether the entered password has upper case letter
					this.patternValidator(/[A-Z]/, {
						hasCapitalCase: true
					}),
					// check whether the entered password has a lower case letter
					this.patternValidator(/[a-z]/, {
						hasSmallCase: true
					}),
					// check whether the entered password has a special character
					this.patternValidator(
						/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
					{
						hasSpecialCharacters: true
					}
				)
				])
			]],
			confirmPassword: [null, [Validators.required,
				Validators.minLength(8), Validators.maxLength(15),
				WhiteSpaceValidator.noWhiteSpace,
				Validators.compose([
					Validators.required,
					// check whether the entered password has a number
					this.patternValidator(/\d/, {
						hasNumber: true
					}),
					// check whether the entered password has upper case letter
					this.patternValidator(/[A-Z]/, {
						hasCapitalCase: true
					}),
					// check whether the entered password has a lower case letter
					this.patternValidator(/[a-z]/, {
						hasSmallCase: true
					}),
					// check whether the entered password has a special character
					this.patternValidator(
						/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
					{
						hasSpecialCharacters: true
					}
				)
				])
			]],
      otp:['', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]]
		}, {
			validator: ConfirmPasswordValidator('password', 'confirmPassword')
		});
	}


  public showPassword(): void {
    this.showPasswordText = !this.showPasswordText;
  }

  public showConfirmPassword(): void {
    this.showConfirmPasswordText = !this.showConfirmPasswordText;
  }
  resetPassword()
  {
	if(this.resetPasswordForm.valid){
		//implement reset password
	}
  }

 patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }
  numericOnly(event:any): boolean {
    const charcode = event.which ? event.which : event.keyCode;
    if (charcode >= 48 && charcode <= 57) {
      return true;
    }
    return false;
  }


}
