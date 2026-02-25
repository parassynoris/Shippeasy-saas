import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataEntryComponent } from './add-data-entry.component';

describe('AddDataEntryComponent', () => {
  let component: AddDataEntryComponent;
  let fixture: ComponentFixture<AddDataEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDataEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
