// http.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl = 'http://localhost:3000';  // Set your server base URL here

  constructor(private http: HttpClient) { }

  // Generic POST method that directly returns the Observable
  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${"/api/"+endpoint}`;
    return this.http.post<T>(url, body);
  }
}
