import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExBondBillEntrysComponent } from './ex-bond-bill-entrys.component';


describe('InwardsComponent', () => {
  let component: ExBondBillEntrysComponent;
  let fixture: ComponentFixture<ExBondBillEntrysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExBondBillEntrysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExBondBillEntrysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
