import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProducerComponent } from './detail-producer.component.ts';

describe('DetailProducerComponent', () => {
  let component: DetailProducerComponent;
  let fixture: ComponentFixture<DetailProducerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailProducerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailProducerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
