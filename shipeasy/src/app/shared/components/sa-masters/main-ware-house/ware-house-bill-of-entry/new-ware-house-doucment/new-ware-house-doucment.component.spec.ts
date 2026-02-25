import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWareHouseDoucmentComponent } from './new-ware-house-doucment.component';

describe('NewWareHouseDoucmentComponent', () => {
  let component: NewWareHouseDoucmentComponent;
  let fixture: ComponentFixture<NewWareHouseDoucmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewWareHouseDoucmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWareHouseDoucmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
