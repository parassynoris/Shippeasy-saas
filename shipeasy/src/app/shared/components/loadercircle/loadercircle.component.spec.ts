import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadercircleComponent } from './loadercircle.component';

describe('LoadercircleComponent', () => {
  let component: LoadercircleComponent;
  let fixture: ComponentFixture<LoadercircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadercircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadercircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
