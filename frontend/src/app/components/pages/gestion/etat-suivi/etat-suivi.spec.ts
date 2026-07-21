import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatSuivi } from './etat-suivi';

describe('EtatSuivi', () => {
  let component: EtatSuivi;
  let fixture: ComponentFixture<EtatSuivi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtatSuivi],
    }).compileComponents();

    fixture = TestBed.createComponent(EtatSuivi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
