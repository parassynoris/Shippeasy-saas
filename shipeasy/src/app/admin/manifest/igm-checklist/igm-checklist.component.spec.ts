import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgmChecklistComponent } from './igm-checklist.component';

describe('IgmChecklistComponent', () => {
  let component: IgmChecklistComponent;
  let fixture: ComponentFixture<IgmChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgmChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgmChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
