import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBlStatusComponent } from './update-bl-status.component';

describe('UpdateBlStatusComponent', () => {
  let component: UpdateBlStatusComponent;
  let fixture: ComponentFixture<UpdateBlStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateBlStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateBlStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
