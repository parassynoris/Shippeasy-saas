import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateOutDataComponent } from './gate-out-data.component';

describe('GateOutDataComponent', () => {
  let component: GateOutDataComponent;
  let fixture: ComponentFixture<GateOutDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GateOutDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GateOutDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
