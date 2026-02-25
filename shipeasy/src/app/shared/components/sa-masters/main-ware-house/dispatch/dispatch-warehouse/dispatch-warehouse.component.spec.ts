import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchWarehouseComponent } from './dispatch-warehouse.component';

describe('DispatchWarehouseComponent', () => {
  let component: DispatchWarehouseComponent;
  let fixture: ComponentFixture<DispatchWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispatchWarehouseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
