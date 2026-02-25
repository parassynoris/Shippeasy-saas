import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddvoyageComponent } from './addvoyage.component';

describe('AddvoyageComponent', () => {
  let component: AddvoyageComponent;
  let fixture: ComponentFixture<AddvoyageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddvoyageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddvoyageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
