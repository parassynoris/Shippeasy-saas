import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBLComponent } from './new-bl.component';

describe('NewBLComponent', () => {
  let component: NewBLComponent;
  let fixture: ComponentFixture<NewBLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBLComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
