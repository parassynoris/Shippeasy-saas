import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorryReceiptTableComponent } from './lorry-receipt-table.component';

describe('LorryReceiptTableComponent', () => {
  let component: LorryReceiptTableComponent;
  let fixture: ComponentFixture<LorryReceiptTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LorryReceiptTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LorryReceiptTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
