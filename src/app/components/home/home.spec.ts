//home.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home';  // ✅ Nombre correcto de la clase

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]  // ✅ Nombre correcto
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});