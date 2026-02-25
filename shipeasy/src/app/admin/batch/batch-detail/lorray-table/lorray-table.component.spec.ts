import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorrayTableComponent } from './lorray-table.component';

describe('LorrayTableComponent', () => {
  let component: LorrayTableComponent;
  let fixture: ComponentFixture<LorrayTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LorrayTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LorrayTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
