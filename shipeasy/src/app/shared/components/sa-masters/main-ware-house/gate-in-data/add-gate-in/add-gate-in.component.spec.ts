import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGateInComponent } from './add-gate-in.component';

describe('AddGateInComponent', () => {
  let component: AddGateInComponent;
  let fixture: ComponentFixture<AddGateInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGateInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGateInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
