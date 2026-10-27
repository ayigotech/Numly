import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgePage } from './age.page';

describe('AgePage', () => {
  let component: AgePage;
  let fixture: ComponentFixture<AgePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
