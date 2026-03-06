import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tap, delay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = "usermanagement/diaboslogin";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'aapplication/json; charset=UTF-8'
    })
  }
  isUserLoggedIn: boolean = false;
  constructor(private http: HttpClient, private router: Router) {
    // do nothing.
  }

  login(username: string, password: string): Observable<any> {

    this.isUserLoggedIn = !!username && !!password;
    localStorage.setItem('isUserLoggedIn', this.isUserLoggedIn ? "true" : "false");

    return of(this.isUserLoggedIn).pipe(
      delay(1000),
      tap(val => {
        // do nothing.
      })
    );
  }

  logout(): void {
    this.isUserLoggedIn = false;
    localStorage.removeItem('isUserLoggedIn');
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

}
