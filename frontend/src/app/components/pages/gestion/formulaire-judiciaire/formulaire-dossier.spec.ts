import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireDossier } from './formulaire-dossier';

describe('FormulaireDossier', () => {
  let component: FormulaireDossier;
  let fixture: ComponentFixture<FormulaireDossier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireDossier],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireDossier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
