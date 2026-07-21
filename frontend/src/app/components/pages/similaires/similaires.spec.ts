import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Similaires } from './similaires';

describe('Similaires', () => {
  let component: Similaires;
  let fixture: ComponentFixture<Similaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Similaires],
    }).compileComponents();

    fixture = TestBed.createComponent(Similaires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
