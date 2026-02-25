import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiProgressBarComponent } from './api-progress-bar.component';

describe('ApiProgressBarComponent', () => {
  let component: ApiProgressBarComponent;
  let fixture: ComponentFixture<ApiProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiProgressBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
