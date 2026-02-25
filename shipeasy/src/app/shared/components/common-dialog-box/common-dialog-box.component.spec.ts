import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDialogBoxComponent } from './common-dialog-box.component';

describe('CommonDialogBoxComponent', () => {
  let component: CommonDialogBoxComponent;
  let fixture: ComponentFixture<CommonDialogBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDialogBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
