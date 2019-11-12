import { TestBed } from '@angular/core/testing';

import { ProductImagesService } from './product-images.service';

describe('ProductImagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProductImagesService = TestBed.get(ProductImagesService);
    expect(service).toBeTruthy();
  });
});
