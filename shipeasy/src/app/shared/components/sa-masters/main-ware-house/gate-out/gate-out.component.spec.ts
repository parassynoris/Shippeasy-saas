import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateOutComponent } from './gate-out.component';

describe('GateOutComponent', () => {
  let component: GateOutComponent;
  let fixture: ComponentFixture<GateOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GateOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GateOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
