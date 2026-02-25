import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TariffCalculatorComponent } from './tariff-calculator.component';

describe('TariffCalculatorComponent', () => {
  let component: TariffCalculatorComponent;
  let fixture: ComponentFixture<TariffCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TariffCalculatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TariffCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
