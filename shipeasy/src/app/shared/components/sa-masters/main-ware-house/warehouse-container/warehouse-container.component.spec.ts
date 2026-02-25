import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseContainerComponent } from './warehouse-container.component';

describe('WarehouseContainerComponent', () => {
  let component: WarehouseContainerComponent;
  let fixture: ComponentFixture<WarehouseContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
