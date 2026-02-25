import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInOutComponent } from './payment-in-out.component';

describe('PaymentInOutComponent', () => {
  let component: PaymentInOutComponent;
  let fixture: ComponentFixture<PaymentInOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentInOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
