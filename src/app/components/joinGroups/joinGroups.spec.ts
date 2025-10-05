import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JoinGroups } from './joinGroups';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Import FormsModule to support ngModel
import { of } from 'rxjs';

describe('JoinGroups', () => {
  let component: JoinGroups;
  let fixture: ComponentFixture<JoinGroups>;
  let httpMock: HttpTestingController;
  let routerMock: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule], // Add FormsModule here
      declarations: [JoinGroups],
      providers: [
        { provide: Router, useValue: { navigate: jasmine.createSpy() } }, // Mock Router
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinGroups);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    routerMock = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "/" if there is no valid item in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null); // Simulate no "valid" item in localStorage
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should submit the group data successfully', () => {
    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'id') return '123';
      if (key === 'username') return 'testUser';
      return null;
    });

    component.groupName = 'testGroup';

    // Call onSubmit
    component.onSubmit();

    // Mock HTTP request and respond with 200 OK
    const req = httpMock.expectOne('http://localhost:3000/api/groupRequest');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      id: '123',
      username: 'testUser',
      groupId: 'testGroup',
    });

    req.flush({}); // Simulate a successful response

    // After submission, groupName should be reset
    expect(component.groupName).toBe('');
  });
});
