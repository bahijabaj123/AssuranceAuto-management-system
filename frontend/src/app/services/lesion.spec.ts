import { TestBed } from '@angular/core/testing';

import { Lesion } from './lesion';

describe('Lesion', () => {
  let service: Lesion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lesion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
