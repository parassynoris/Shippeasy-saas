import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVendorBillComponent } from './new-vendor-bill.component';

describe('NewVendorBillComponent', () => {
  let component: NewVendorBillComponent;
  let fixture: ComponentFixture<NewVendorBillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewVendorBillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVendorBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
