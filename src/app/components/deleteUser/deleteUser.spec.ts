import { TestBed } from '@angular/core/testing';
import { DeleteUser } from './deleteUser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Mock Router to be injected
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('DeleteUser Component', () => {
  let component: DeleteUser;
  let httpMock: HttpTestingController;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DeleteUser],
      providers: [
        { provide: Router, useValue: mockRouter },  // Use mocked Router
      ]
    });

    component = TestBed.createComponent(DeleteUser).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('deleteAccount', () => {
    it('should delete user account and navigate to the homepage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('user'); // Mock username
      spyOn(localStorage, 'clear');

      // Mock server response
      const mockResponse = { success: true };

      component.deleteAccount();  // Call method that should make the HTTP request

      const req = httpMock.expectOne(`${component.server}/api/delete`);  // Expect a DELETE request
      expect(req.request.method).toBe('POST');  // Ensure it's a POST request
      expect(req.request.body).toEqual({ username: 'user' });  // Ensure correct body

      req.flush(mockResponse);  // Simulate successful response

      // Assert that localStorage.clear was called
      expect(localStorage.clear).toHaveBeenCalled();

      // Ensure that navigate was called after successful account deletion
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when deleting user account', () => {
      spyOn(localStorage, 'getItem').and.returnValue('user');  // Mock username
      spyOn(localStorage, 'clear');

      // Simulate server error response
      const mockError = { error: 'Server error' };

      component.deleteAccount();  // Call method

      const req = httpMock.expectOne(`${component.server}/api/delete`);
      req.flush(mockError, { status: 500, statusText: 'Server error' });  // Simulate error response

      // Ensure localStorage.clear was still called even in case of error
      expect(localStorage.clear).toHaveBeenCalled();

      // Ensure that navigate was NOT called due to error
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccountSuperAdmin', () => {
    it('should delete user account by super admin', () => {
      component.isSuperAdmin = true;
      component.userInput = 'adminUser'; // Set username for super admin to delete

      // Mock server response
      const mockResponse = { success: true };

      component.deleteAccountSuperAdmin();

      const req = httpMock.expectOne(`${component.server}/api/delete`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'adminUser' });

      req.flush(mockResponse);

      // Ensure the input is reset after successful deletion
      expect(component.userInput).toBe('');
    });

    it('should handle error when super admin fails to delete account', () => {
      component.isSuperAdmin = true;
      component.userInput = 'adminUser';  // Set username for super admin to delete

      // Simulate error response
      const mockError = { error: 'Server error' };

      component.deleteAccountSuperAdmin();

      const req = httpMock.expectOne(`${component.server}/api/delete`);
      req.flush(mockError, { status: 500, statusText: 'Server error' });

      // Ensure that the input is reset on error
      expect(component.userInput).toBe('');
    });

  describe('ngOnInit', () => {
    it('should check if the user is a super admin', () => {
      spyOn(localStorage, 'getItem').and.returnValue('superAdmin,user');
      
      component.ngOnInit();  // Call ngOnInit to set up super admin check

      expect(component.isSuperAdmin).toBe(true);
    });

    it('should not set isSuperAdmin if the user does not have superAdmin role', () => {
      spyOn(localStorage, 'getItem').and.returnValue('user');

      component.ngOnInit();

      expect(component.isSuperAdmin).toBe(false);
    });

    it('should redirect if the user is not valid', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);  // Mock invalid user (no valid key)

      component.ngOnInit();

      // Ensure the user is redirected if not valid
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
  });
});
