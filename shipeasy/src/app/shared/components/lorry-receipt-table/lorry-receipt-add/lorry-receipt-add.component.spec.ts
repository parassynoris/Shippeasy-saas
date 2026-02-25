import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorryReceiptAddComponent } from './lorry-receipt-add.component';

describe('LorryReceiptAddComponent', () => {
  let component: LorryReceiptAddComponent;
  let fixture: ComponentFixture<LorryReceiptAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LorryReceiptAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LorryReceiptAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
