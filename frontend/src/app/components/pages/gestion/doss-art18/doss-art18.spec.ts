import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossArt18 } from './doss-art18';

describe('DossArt18', () => {
  let component: DossArt18;
  let fixture: ComponentFixture<DossArt18>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossArt18],
    }).compileComponents();

    fixture = TestBed.createComponent(DossArt18);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
