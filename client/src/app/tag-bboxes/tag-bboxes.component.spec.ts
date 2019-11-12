import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagBboxesComponent } from './tag-bboxes.component';

describe('TagBboxesComponent', () => {
  let component: TagBboxesComponent;
  let fixture: ComponentFixture<TagBboxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagBboxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagBboxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
