import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubitizingPage } from './subitizing.page';

describe('SubitizingPage', () => {
  let component: SubitizingPage;
  let fixture: ComponentFixture<SubitizingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubitizingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
