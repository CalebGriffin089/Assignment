import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Login } from './login';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Login],
      imports: [
        HttpClientTestingModule,      // To mock HttpClient
        RouterTestingModule,          // To mock router navigation
        FormsModule                   // To handle ngModel in the template
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and navigate to /chat on valid credentials', () => {
    component.user.username = 'testUser';
    component.user.password = 'testPassword';

    const mockResponse = {
      valid: true,
      username: 'testUser',
      id: '123',
      password: 'testPassword',
      email: 'test@example.com',
      roles: 'admin',
      groups: ['group1'],
      profile: 'profileInfo'
    };

    component.onLogin();  // Trigger login action

    const req = httpMock.expectOne('http://localhost:3000/api/auth');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);  // Simulate a successful response

    expect(localStorage.getItem('username')).toBe('testUser');
    expect(localStorage.getItem('id')).toBe('123');
    expect(localStorage.getItem('roles')).toBe("admin");
    expect(navigateSpy).toHaveBeenCalledWith(['/chat']);
  });

  it('should show an error message on invalid credentials', () => {
    component.user.username = 'testUser';
    component.user.password = 'wrongPassword';

    const mockResponse = { valid: false };

    component.onLogin();  // Trigger login action

    const req = httpMock.expectOne('http://localhost:3000/api/auth');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);  // Simulate an invalid response

    expect(component.errorMsg).toBe('Invalid credentials');
  });

  it('should not make HTTP request if username or password is empty', () => {
    component.user.username = '';
    component.user.password = '';
    spyOn(component, 'onLogin').and.callThrough();

    component.onLogin();  // Trigger login action

    expect(component.onLogin).toHaveBeenCalled();
    httpMock.verify();  // Ensure no HTTP request is made
  });

});
