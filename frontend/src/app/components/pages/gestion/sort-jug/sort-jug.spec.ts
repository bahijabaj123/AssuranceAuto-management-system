import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortJug } from './sort-jug';

describe('SortJug', () => {
  let component: SortJug;
  let fixture: ComponentFixture<SortJug>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortJug],
    }).compileComponents();

    fixture = TestBed.createComponent(SortJug);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
