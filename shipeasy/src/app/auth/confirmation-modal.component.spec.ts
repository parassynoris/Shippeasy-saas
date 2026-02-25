import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../services/common/common.service';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { By } from '@angular/platform-browser';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;
  let mockDialogRef: MatDialogRef<ConfirmationModalComponent>;
  let mockCommonService: CommonService;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj(['close']);
    mockCommonService = jasmine.createSpyObj(['getFormFieldErrorMessage']);

    await TestBed.configureTestingModule({
      declarations: [ ConfirmationModalComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { statusUpdateModal: true } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const form = component.confirmForm;
    expect(form).toBeDefined();
    expect(form.controls['remarksEntered']).toBeDefined();
    expect(form.controls['remarksEntered'].value).toBe('');
  });

  it('should get form field error message', () => {
    const formGroup = 'confirmForm';
    const formControlName = 'remarksEntered';
    component.getFormFieldErrorMessage(formGroup, formControlName);
    expect(mockCommonService.getFormFieldErrorMessage).toHaveBeenCalledWith(component.confirmForm, formControlName);
  });

  it('should mark remarksEntered as touched if form is invalid and user choice is true', () => {
    component.confirmForm.controls['remarksEntered'].setValue('');
    component.closeConfirmDialog(true);
    expect(component.confirmForm.controls['remarksEntered'].touched).toBeTrue();
  });

  it('should close dialog with correct data when form is valid and user choice is true', () => {
    component.confirmForm.controls['remarksEntered'].setValue('Some remarks');
    component.closeConfirmDialog(true);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      userChoice: true,
      remarksEntered: 'Some remarks'
    });
  });

  it('should close dialog with correct data when user choice is false', () => {
    component.confirmForm.controls['remarksEntered'].setValue('Some remarks');
    component.closeConfirmDialog(false);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      userChoice: false,
      remarksEntered: 'Some remarks'
    });
  });

  it('should reset form after closing dialog', () => {
    component.confirmForm.controls['remarksEntered'].setValue('Some remarks');
    component.closeConfirmDialog(false);
    expect(component.confirmForm.controls['remarksEntered'].value).toBe(null);
  });
  it('should not mark remarksEntered as touched if form is invalid and user choice is false', () => {
    component.confirmForm.controls['remarksEntered'].setValue('');
    component.closeConfirmDialog(false);
    expect(component.confirmForm.controls['remarksEntered'].touched).toBeFalse();
  });
  it('should call dialogRef.close when closeConfirmDialog is called with userChoice as false', () => {
    component.closeConfirmDialog(false);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      userChoice: false,
      remarksEntered: ''
    });
  });

  it('should validate the remarksEntered control as required', () => {
    const control = component.confirmForm.get('remarksEntered');
    control!.setValue('');
    expect(control!.valid).toBeFalsy();
    control!.setValue('Some remarks');
    expect(control!.valid).toBeTruthy();
  });

  it('should call closeConfirmDialog with true and form should be invalid', () => {
    spyOn(component, 'closeConfirmDialog').and.callThrough();
    component.confirmForm.controls['remarksEntered'].setValue('');
    component.closeConfirmDialog(true);
    expect(component.closeConfirmDialog).toHaveBeenCalledWith(true);
    expect(component.confirmForm.valid).toBeFalsy();
  });

  it('should call closeConfirmDialog with false and form should remain untouched', () => {
    spyOn(component, 'closeConfirmDialog').and.callThrough();
    component.confirmForm.controls['remarksEntered'].setValue('');
    component.closeConfirmDialog(false);
    expect(component.closeConfirmDialog).toHaveBeenCalledWith(false);
    expect(component.confirmForm.controls['remarksEntered'].touched).toBeFalse();
  });

  it('should reset the form when the dialog is closed', () => {
    spyOn(component.confirmForm, 'reset');
    component.closeConfirmDialog(false);
    expect(component.confirmForm.reset).toHaveBeenCalled();
  });

  it('should close the dialog with correct data when form is valid', () => {
    component.confirmForm.controls['remarksEntered'].setValue('Valid remarks');
    component.closeConfirmDialog(true);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      userChoice: true,
      remarksEntered: 'Valid remarks'
    });
  });
});