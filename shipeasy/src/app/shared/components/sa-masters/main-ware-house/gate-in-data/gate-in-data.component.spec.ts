import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateInDataComponent } from './gate-in-data.component';

describe('GateInDataComponent', () => {
  let component: GateInDataComponent;
  let fixture: ComponentFixture<GateInDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GateInDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GateInDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
