import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHousePackingAddComponent } from './ware-house-packing-add.component';

describe('WareHousePackingAddComponent', () => {
  let component: WareHousePackingAddComponent;
  let fixture: ComponentFixture<WareHousePackingAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHousePackingAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHousePackingAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
