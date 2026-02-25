import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDocumentComponent } from './warehouse-document.component';

describe('WarehouseDocumentComponent', () => {
  let component: WarehouseDocumentComponent;
  let fixture: ComponentFixture<WarehouseDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
