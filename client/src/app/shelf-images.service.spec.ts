import { TestBed } from '@angular/core/testing';

import { ShelfImagesService } from './shelf-images.service';

describe('ShelfImagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShelfImagesService = TestBed.get(ShelfImagesService);
    expect(service).toBeTruthy();
  });
});
