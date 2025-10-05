import { TestBed } from '@angular/core/testing';
import { CreateGroup } from './createGroups';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Mock Router class to simulate the router's behavior
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('CreateGroup Component', () => {
  let component: CreateGroup;
  let httpMock: HttpTestingController;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [CreateGroup],
      providers: [
        { provide: Router, useValue: mockRouter },
      ]
    });

    component = TestBed.createComponent(CreateGroup).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('ngOnInit', () => {
    it('should set isAdmin to true if user has admin or superAdmin role', () => {
      spyOn(localStorage, 'getItem').and.returnValue('admin'); // Simulate a role of 'admin'

      component.ngOnInit();  // Initialize the component

      expect(component.isAdmin).toBe(true);
    });

    it('should set isAdmin to false if user has no admin or superAdmin role', () => {
      spyOn(localStorage, 'getItem').and.returnValue('user'); // Simulate a role of 'user'

      component.ngOnInit();

      expect(component.isAdmin).toBe(false);
    });

    it('should redirect if user is not valid', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null); // Simulate no valid user

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('createGroup', () => {
    it('should create a group and navigate to /chat when successful', () => {
      component.groupData.channels = 'General';  // Set the group data

      const mockResponse = { valid: true };  // Mock response from server

      spyOn(localStorage, 'getItem').and.returnValue('username');  // Mock username in localStorage

      component.createGroup();  // Trigger the group creation

      const req = httpMock.expectOne(`${component.server}/api/createGroup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(component.groupData);  // Check if the request body matches

      req.flush(mockResponse);  // Mock the response

      // Check if router navigated to /chat
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat']);
    });

    it('should not send a request if the group channels are empty', () => {
      component.groupData.channels = '';  // Empty channels, should not send request

      spyOn(localStorage, 'getItem').and.returnValue('username');

      component.createGroup();

      httpMock.expectNone(`${component.server}/api/createGroup`);  // Ensure no request is made
      expect(mockRouter.navigate).not.toHaveBeenCalled();  // Ensure no navigation
    });

    it('should handle error when group creation fails', () => {
      component.groupData.channels = 'General';  // Set the group data

      const mockError = { error: 'Server error' };  // Mock error from server

      spyOn(localStorage, 'getItem').and.returnValue('username');

      component.createGroup();

      const req = httpMock.expectOne(`${component.server}/api/createGroup`);
      req.flush(mockError, { status: 500, statusText: 'Server error' });

      // Check that the error is handled and the router does not navigate
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
