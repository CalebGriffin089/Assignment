import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // Import HttpClientTestingModule
import { ImguploadService } from './imgupload.service';

describe('ImguploadService', () => {
  let service: ImguploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]  // Add HttpClientTestingModule to imports
    });
    service = TestBed.inject(ImguploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
