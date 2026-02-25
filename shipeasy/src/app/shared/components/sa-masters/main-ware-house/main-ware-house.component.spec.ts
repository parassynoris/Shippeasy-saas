import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainWareHouseComponent } from './main-ware-house.component';

describe('MainWareHouseComponent', () => {
  let component: MainWareHouseComponent;
  let fixture: ComponentFixture<MainWareHouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainWareHouseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainWareHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
