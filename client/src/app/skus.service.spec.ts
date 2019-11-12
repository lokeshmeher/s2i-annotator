import { TestBed } from '@angular/core/testing';

import { SkusService } from './skus.service';

describe('SkusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SkusService = TestBed.get(SkusService);
    expect(service).toBeTruthy();
  });
});
