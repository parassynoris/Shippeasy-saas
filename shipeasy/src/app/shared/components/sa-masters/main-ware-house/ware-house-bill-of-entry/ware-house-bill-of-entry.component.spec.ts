import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHouseBillOfEntryComponent } from './ware-house-bill-of-entry.component';

describe('WareHouseBillOfEntryComponent', () => {
  let component: WareHouseBillOfEntryComponent;
  let fixture: ComponentFixture<WareHouseBillOfEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHouseBillOfEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHouseBillOfEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
