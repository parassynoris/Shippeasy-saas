import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEntryDetailsComponent } from './data-entry-details.component';

describe('DataEntryDetailsComponent', () => {
  let component: DataEntryDetailsComponent;
  let fixture: ComponentFixture<DataEntryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataEntryDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEntryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
