import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExBondBillentryComponentAdd } from './ex-bond-billentry-add.component';


describe('ExBondBillentryComponentAdd', () => {
  let component: ExBondBillentryComponentAdd;
  let fixture: ComponentFixture<ExBondBillentryComponentAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExBondBillentryComponentAdd ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExBondBillentryComponentAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
