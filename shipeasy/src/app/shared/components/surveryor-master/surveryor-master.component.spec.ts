import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveryorMasterComponent } from './surveryor-master.component';

describe('SurveryorMasterComponent', () => {
  let component: SurveryorMasterComponent;
  let fixture: ComponentFixture<SurveryorMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveryorMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveryorMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
