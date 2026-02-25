import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchBackupComponent } from './batch-backup.component';

describe('BatchBackupComponent', () => {
  let component: BatchBackupComponent;
  let fixture: ComponentFixture<BatchBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchBackupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
