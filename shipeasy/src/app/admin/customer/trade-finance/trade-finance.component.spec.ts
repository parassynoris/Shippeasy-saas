import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeFinanceComponent } from './trade-finance.component';

describe('TradeFinanceComponent', () => {
  let component: TradeFinanceComponent;
  let fixture: ComponentFixture<TradeFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeFinanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
