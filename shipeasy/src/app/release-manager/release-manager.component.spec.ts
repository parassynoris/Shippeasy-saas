import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseManagerComponent } from './release-manager.component';

describe('ReleaseManagerComponent', () => {
  let component: ReleaseManagerComponent;
  let fixture: ComponentFixture<ReleaseManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
