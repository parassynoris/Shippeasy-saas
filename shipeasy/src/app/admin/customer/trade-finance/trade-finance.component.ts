import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-trade-finance',
  templateUrl: './trade-finance.component.html',
  styleUrls: ['./trade-finance.component.scss']
})
export class TradeFinanceComponent implements OnInit {
  @Input() isType: string = 'add';
  @Output() CloseBillSection = new EventEmitter<string>();

  loanForm!: FormGroup;
  submitted = false;
  showRemarks: boolean = false;
  currentId: string | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  
  uploadedFiles: { [key: string]: File | null } = {
    bankStatement: null,
    balanceSheet1: null,
    balanceSheet2: null,
    itr1: null,
    itr2: null
  };

  fileNames: { [key: string]: string } = {
    bankStatement: '',
    balanceSheet1: '',
    balanceSheet2: '',
    itr1: '',
    itr2: ''
  };

  existingDocuments: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    this.route.params.subscribe(params => {
      this.currentId = params['id'];
      if (this.currentId) {
        this.isEditMode = true;
        this.loadDataForEdit(this.currentId);
      }
    });
  }

  initializeForm(): void {
    this.loanForm = this.fb.group({
      existingBankers: this.fb.group({
        accountNames: [''],
        mobileNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
        bankBranch: [''],
        accountType: [''],
      }),

      loanOutstanding: this.fb.group({
        type1Amount: [''],
        type1FacilityType: [''],
        type2Amount: [''],
        type2FacilityType: [''],
      }),

      companyDetails: this.fb.group({
        fullCompanyName: [''],
        panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
        companyAddress: [''],
        iecCode: [''],
        gstNumber: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],
        cinNumber: [''],
        incorporationDate: [null],
        businessNature: [''],
      }),

      shareholders: this.fb.array([
        this.createShareholderGroup(),
        this.createShareholderGroup(),
        this.createShareholderGroup(),
        this.createShareholderGroup()
      ]),

      businessType: this.fb.group({
        type: ['exporter'],
        buyerName: [''],
        commodityExported: [''],
        destinationCountry: [''],
        lcTerms: [false],
      }),

      buyerCompanies: this.fb.array([
        this.createBuyerCompanyGroup(),
        this.createBuyerCompanyGroup(),
        this.createBuyerCompanyGroup(),
        this.createBuyerCompanyGroup()
      ]),

      financeDetails: this.fb.group({
        expectedF23Turnover: [''],
        sanctionRequirement: [''],
        remarks: [''],
        loanPurpose: [''],
        repaymentPeriod: [''],
      }),

      agreeToTerms: [false, Validators.requiredTrue],
    });
  }

  loadDataForEdit(id: string): void {
    this.isLoading = true;

    const payload = {
      query: { tradefinanceId: id },
      options: {
        select: [],
        sort: {},
        populate: [],
        pagination: false
      }
    };

    this.commonService.getSTList("tradefinance", payload)?.subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res?.documents?.length > 0) {
          const data = res.documents[0];
          this.currentId = data.tradefinanceId;
          this.patchFormData(data);
          
          // CRITICAL: Mark form as pristine after patching to avoid validation errors
          this.loanForm.markAsPristine();
          this.loanForm.markAsUntouched();
          this.submitted = false;
        } else {
          this.notification.create('error', 'No data found for this ID', '');
          this.router.navigate(['/customer/trade-finance/list']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading data:', error);
        this.notification.create('error', 'Failed to load data', error?.error?.message || '');
      }
    });
  }

  patchFormData(data: any): void {
    if (!data) return;

    // Patch existing bankers
    if (data.existingBankers) {
      this.loanForm.patchValue({ existingBankers: data.existingBankers });
    }

    // Patch loan outstanding
    if (data.loanOutstanding) {
      this.loanForm.patchValue({ loanOutstanding: data.loanOutstanding });
    }

    // Patch company details
    if (data.companyDetails) {
      if (data.companyDetails.incorporationDate) {
        data.companyDetails.incorporationDate = new Date(data.companyDetails.incorporationDate);
      }
      this.loanForm.patchValue({ companyDetails: data.companyDetails });
    }

    // Patch business type
    if (data.businessType) {
      this.loanForm.patchValue({ businessType: data.businessType });
    }

    // Patch finance details
    if (data.financeDetails) {
      this.loanForm.patchValue({ financeDetails: data.financeDetails });
      if (data.financeDetails.remarks) {
        this.showRemarks = true;
      }
    }

    // Patch shareholders
    if (data.shareholders && Array.isArray(data.shareholders)) {
      const shareholdersArray = this.loanForm.get('shareholders') as FormArray;
      shareholdersArray.clear();
      
      data.shareholders.forEach((shareholder: any) => {
        const group = this.createShareholderGroup();
        group.patchValue(shareholder);
        shareholdersArray.push(group);
      });
    }

    // Patch buyer companies
    if (data.buyerCompanies && Array.isArray(data.buyerCompanies)) {
      const buyerCompaniesArray = this.loanForm.get('buyerCompanies') as FormArray;
      buyerCompaniesArray.clear();
      
      data.buyerCompanies.forEach((company: any) => {
        const group = this.createBuyerCompanyGroup();
        group.patchValue(company);
        buyerCompaniesArray.push(group);
      });
    }

    // Handle documents
    if (data.documents) {
      this.existingDocuments = { ...data.documents };
      
      Object.keys(data.documents).forEach(key => {
        if (data.documents[key]) {
          this.existingDocuments[key] = data.documents[key];
          
          if (data.fileNames && data.fileNames[key]) {
            this.fileNames[key] = data.fileNames[key];
          } else {
            const urlParts = data.documents[key].split('/');
            this.fileNames[key] = urlParts[urlParts.length - 1];
          }
        }
      });
    }

    // Patch terms
    if (data.agreeToTerms !== undefined) {
      this.loanForm.patchValue({ agreeToTerms: data.agreeToTerms });
    }
  }

  createShareholderGroup(): FormGroup {
    return this.fb.group({
      fullName: [''],
      mobileNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
      email: ['', Validators.email],
      shareholding: [''],
    });
  }

  createBuyerCompanyGroup(): FormGroup {
    return this.fb.group({
      companyName: [''],
      country: [''],
      contactPerson: [''],
      contactEmail: ['', Validators.email],
    });
  }

  get shareholders(): FormArray {
    return this.loanForm.get('shareholders') as FormArray;
  }

  get buyerCompanies(): FormArray {
    return this.loanForm.get('buyerCompanies') as FormArray;
  }

  hasExistingDocument(docType: string): boolean {
    return !!(this.existingDocuments[docType] || this.fileNames[docType]);
  }

  onFileSelect(event: any, docType: string): void {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.uploadedFiles[docType] = file;
      this.fileNames[docType] = file.name;
      console.log(`File selected for ${docType}:`, file.name);
    } else {
      this.notification.create('warning', 'Please upload only PDF files', '');
      event.target.value = '';
    }
  }

  triggerFileInput(docType: string): void {
    const fileInput = document.getElementById(`file-${docType}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async uploadAllDocuments(): Promise<{ [key: string]: string }> {
    const uploadedUrls: { [key: string]: string } = {};
    const keys = Object.keys(this.uploadedFiles);
  
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const file = this.uploadedFiles[key];
  
      if (file) {
        try {
          uploadedUrls[key] = await this.uploadSingleDocument(key, file);
        } catch (err) {
          throw new Error(`Upload failed for ${key}`);
        }
      } else if (this.existingDocuments[key]) {
        uploadedUrls[key] = this.existingDocuments[key];
      }
    }
  
    return uploadedUrls;
  }

  async uploadSingleDocument(key: string, file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('name', file.name);
  
      this.commonService.uploadDocuments('uploadfile', formData)?.subscribe({
        next: (res: any) => {
          const uploadedUrl = res?.url || `uploaded/${file.name}`;
          console.log(`Uploaded ${key}:`, uploadedUrl);
          resolve(uploadedUrl);
        },
        error: (err) => {
          console.error(`Failed to upload ${key}`, err);
          reject(err);
        }
      });
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.loanForm.get(fieldName);
    // Only show errors if field is touched OR form is submitted
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loanForm.get(fieldName);
    
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }

    if (field.errors['pattern']) {
      if (fieldName.includes('mobileNumber')) {
        return 'Please enter a valid 10-digit mobile number';
      }
      if (fieldName.includes('panNumber')) {
        return 'Please enter a valid PAN number (e.g., ABCDE1234F)';
      }
      if (fieldName.includes('gstNumber')) {
        return 'Please enter a valid GST number';
      }
      return 'Invalid format';
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    return 'Invalid input';
  }

  documentPreview(docType: string) {
    const docUrl = this.existingDocuments[docType];
    
    if (!docUrl) {
      this.notification.create('warning', 'Document not found', '');
      return;
    }

    this.commonService.downloadDocuments('downloadfile', docUrl).subscribe(
      (res: Blob) => {
        const fileType = docUrl.split('.').pop()?.toLowerCase() || '';
        const blob = new Blob([res], { type: this.getMimeType(fileType) });
        const temp = URL.createObjectURL(blob);
  
        if (fileType === 'pdf') {
          window.open(temp, '_blank');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
          const img = document.createElement('img');
          img.src = temp;
          const imgWindow = window.open('');
          imgWindow?.document.write('<html><body style="margin:0; text-align:center;"></body></html>');
          imgWindow?.document.body.appendChild(img);
        }
      },
      (error) => {
        console.error('Document preview error', error);
        this.notification.create('error', 'Failed to preview document', '');
      }
    );
  }
  
  private getMimeType(ext: string): string {
    const mimeTypes: any = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      webp: 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  
  async onSubmit(): Promise<void> {
    this.submitted = true;
  
    // Check form validity
    if (this.loanForm.invalid) {
      this.markFormGroupTouched(this.loanForm);
      
      // Log which fields are invalid for debugging
      console.log('Form is invalid. Invalid fields:');
      this.logInvalidFields(this.loanForm);
      
      this.notification.create('warning', 'Please fill all required fields correctly', '');
      return;
    }
  
    // Check documents
    const requiredDocs = ['bankStatement', 'balanceSheet1', 'balanceSheet2', 'itr1', 'itr2'];
    const missingDocs = requiredDocs.filter(doc => !this.uploadedFiles[doc] && !this.existingDocuments[doc]);
  
    if (missingDocs.length > 0) {
      this.notification.create('warning', `Please upload all required documents. Missing: ${missingDocs.join(', ')}`, '');
      return;
    }
  
    try {
      const documentUrls = await this.uploadAllDocuments();
  
      const payload: any = {
        ...this.loanForm.value,
        documents: documentUrls,
        fileNames: this.fileNames,
        submittedAt: new Date().toISOString()
      };
  
      if (this.isEditMode && this.currentId) {
        this.commonService.UpdateToST('tradefinance/' + this.currentId, payload).subscribe({
          next: (res) => {
            this.notification.create('success', 'Updated Successfully', '');
            this.onCancel();
          },
          error: (error) => {
            this.notification.create('error', error?.error?.message || 'Update failed', '');
          }
        });
      } else {
        this.commonService.addToST('tradefinance', payload).subscribe({
          next: (res) => {
            this.notification.create('success', 'Saved Successfully', '');
            this.onCancel();
          },
          error: (error) => {
            this.notification.create('error', error?.error?.message || 'Save failed', '');
          }
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      this.notification.create('error', 'File upload failed, please try again', '');
    }
  }

  // Helper method to log invalid fields for debugging
  private logInvalidFields(formGroup: FormGroup | FormArray, parentPath: string = ''): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      const path = parentPath ? `${parentPath}.${key}` : key;
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.logInvalidFields(control, path);
      } else if (control?.invalid) {
        console.log(`Invalid field: ${path}`, control.errors);
      }
    });
  }

  onCancel(): void {
    this.CloseBillSection.emit('close');
    this.router.navigate(['/customer/trade-finance/list']);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}