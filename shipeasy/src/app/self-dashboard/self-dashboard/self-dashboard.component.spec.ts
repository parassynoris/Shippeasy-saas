import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfDashboardComponent } from './self-dashboard.component';

describe('SelfDashboardComponent', () => {
  let component: SelfDashboardComponent;
  let fixture: ComponentFixture<SelfDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
