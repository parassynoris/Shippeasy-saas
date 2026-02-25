import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardsContainerHandoverComponent } from './inwards-container-handover.component';

describe('InwardsComponent', () => {
  let component: InwardsContainerHandoverComponent;
  let fixture: ComponentFixture<InwardsContainerHandoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InwardsContainerHandoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InwardsContainerHandoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
