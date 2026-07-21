import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossProvisoires } from './doss-provisoires';

describe('DossProvisoires', () => {
  let component: DossProvisoires;
  let fixture: ComponentFixture<DossProvisoires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossProvisoires],
    }).compileComponents();

    fixture = TestBed.createComponent(DossProvisoires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
