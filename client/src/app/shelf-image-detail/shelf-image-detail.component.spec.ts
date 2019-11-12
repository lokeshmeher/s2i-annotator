import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelfImageDetailComponent } from './shelf-image-detail.component';

describe('ShelfImageDetailComponent', () => {
  let component: ShelfImageDetailComponent;
  let fixture: ComponentFixture<ShelfImageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShelfImageDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShelfImageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
