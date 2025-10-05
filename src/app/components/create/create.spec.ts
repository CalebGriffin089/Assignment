import { TestBed } from '@angular/core/testing';
import { Create } from './create';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Mock Router class to simulate the router's behavior
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('Create Component', () => {
  let component: Create;
  let httpMock: HttpTestingController;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [Create],
      providers: [
        { provide: Router, useValue: mockRouter },
      ]
    });

    component = TestBed.createComponent(Create).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('onSubmit', () => {
    it('should submit valid data and navigate to /', () => {
      component.user = { username: 'testUser', email: 'test@domain.com', password: 'password123' };

      const mockResponse = { valid: true };  // Mock success response from server

      component.onSubmit();

      const req = httpMock.expectOne(`${component.server}/api/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(component.user);  // Check if the request body matches the user data

      req.flush(mockResponse);  // Mock the server response

      // Check if router navigated to '/'
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when username is already taken', () => {
      component.user = { username: 'testUser', email: 'test@domain.com', password: 'password123' };

      const mockResponse = { valid: false };  // Mock response indicating username is taken

      component.onSubmit();

      const req = httpMock.expectOne(`${component.server}/api/create`);
      req.flush(mockResponse);  // Mock the response

      // Check if the response error message is set correctly
      expect(component.response).toBe('Username Has already been taken');
    });
  });
});
