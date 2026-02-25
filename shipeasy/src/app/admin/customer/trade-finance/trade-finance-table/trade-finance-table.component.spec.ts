import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeFinanceTableComponent } from './trade-finance-table.component';

describe('TradeFinanceTableComponent', () => {
  let component: TradeFinanceTableComponent;
  let fixture: ComponentFixture<TradeFinanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeFinanceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeFinanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
