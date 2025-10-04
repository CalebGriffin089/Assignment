import { HttpClient } from '@angular/common/http';
import { Component, CSP_NONCE, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Sockets } from '../../services/sockets/sockets';
import { ImguploadService } from '../../services/imgupload.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'wditProfile',
  standalone: false,
  templateUrl: './editProfile.html'
})
export class EditProfile {
  title = 'imageupload';
  selectedfile: any = null;
  imagepath = "";
  isLoading = true;
  server = 'http://localhost:3000';

  constructor(
    private imguploadService: ImguploadService,
    private httpService: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  onFileSelected(event: any) {
    this.selectedfile = event.target.files[0];
  }

  onUpload(): void {
    const fd = new FormData();
    if (this.selectedfile) {
      fd.append('image', this.selectedfile, this.selectedfile.name);

      this.imguploadService.imgupload(fd).subscribe(
        res => {
          this.isLoading = false;
          this.imagepath = res.data.filename;
          console.log(res.data.filename)
          console.log('Image uploaded successfully', res);
        },
        error => {
          this.isLoading = false;
          console.error('Image upload failed', error);
          alert('Error uploading image.');
        }
      );
    }
  }

  updateProfile() {
    this.httpService.post(`${this.server}/api/editProfile`, {
      img: this.imagepath,
      username: localStorage.getItem('username')
    }).pipe(
      map((response: any) => {
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during update:', error);
        return of(null);
      })
    ).subscribe();
  }
}
