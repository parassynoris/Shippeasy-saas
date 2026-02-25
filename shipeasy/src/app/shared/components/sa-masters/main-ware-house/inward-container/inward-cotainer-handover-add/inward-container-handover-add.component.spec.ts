import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardContainerHandoverAddComponent } from './inward-container-handover-add.component';

describe('InwardContainerHandoverAddComponent', () => {
  let component: InwardContainerHandoverAddComponent;
  let fixture: ComponentFixture<InwardContainerHandoverAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InwardContainerHandoverAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InwardContainerHandoverAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
