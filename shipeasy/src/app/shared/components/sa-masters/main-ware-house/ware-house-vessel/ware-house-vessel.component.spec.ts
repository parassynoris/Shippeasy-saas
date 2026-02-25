import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHouseVesselComponent } from './ware-house-vessel.component';

describe('WareHouseVesselComponent', () => {
  let component: WareHouseVesselComponent;
  let fixture: ComponentFixture<WareHouseVesselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHouseVesselComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHouseVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
