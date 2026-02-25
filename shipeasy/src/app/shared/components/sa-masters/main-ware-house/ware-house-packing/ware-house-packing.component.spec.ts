import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHousePackingComponent } from './ware-house-packing.component';

describe('WareHousePackingComponent', () => {
  let component: WareHousePackingComponent;
  let fixture: ComponentFixture<WareHousePackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHousePackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHousePackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
