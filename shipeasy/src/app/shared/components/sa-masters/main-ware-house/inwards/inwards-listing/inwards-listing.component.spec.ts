import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardsListingComponent } from './inwards-listing.component';

describe('InwardsListingComponent', () => {
  let component: InwardsListingComponent;
  let fixture: ComponentFixture<InwardsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InwardsListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InwardsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
