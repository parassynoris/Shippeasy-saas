import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchDetailsComponent } from './dispatch-details.component';

describe('DispatchDetailsComponent', () => {
  let component: DispatchDetailsComponent;
  let fixture: ComponentFixture<DispatchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DispatchDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
